import json
import re
from typing import Type, TypeVar
from pydantic import BaseModel
import logging

logger = logging.getLogger(__name__)

T = TypeVar('T', bound=BaseModel)

def invoke_structured(llm, schema_cls: Type[T], messages: list) -> T:
    """
    Custom invoker that handles reasoning models like DeepSeek-R1 by
    stripping <think> tags and manually parsing the JSON output.
    """
    
    
    schema_json = schema_cls.model_json_schema()
    simplified_schema = {}
    for k, v in schema_json.get("properties", {}).items():
        if v.get("type") == "array":
            simplified_schema[k] = ["string"]
        else:
            simplified_schema[k] = "string"
            
    instruction = (
        "\n\nIMPORTANT: You MUST return ONLY valid JSON matching the exact keys below. "
        "Do not include any conversational text, explanations, or markdown formatting. "
        "Generate actual values for these fields. "
        f"\nRequired JSON Format:\n{json.dumps(simplified_schema, indent=2)}"
    )
    
    if isinstance(messages[0], tuple) and messages[0][0] == "system":
        messages[0] = ("system", messages[0][1] + instruction)
    else:
        
        messages.insert(0, ("system", instruction))
        
    try:
        
        if hasattr(llm, "bind"):
            response = llm.bind(format="json").invoke(messages)
        else:
            response = llm.invoke(messages)
            
        content = response.content
        
        
        content = re.sub(r'<think>.*?</think>', '', content, flags=re.DOTALL)
        
        
        start_idx = content.find('{')
        end_idx = content.rfind('}')
        
        if start_idx != -1 and end_idx != -1 and end_idx >= start_idx:
            json_str = content[start_idx:end_idx + 1]
        else:
            json_str = content
            
        from langchain_core.output_parsers import JsonOutputParser
        parser = JsonOutputParser()
        
        try:
            data = parser.parse(json_str)
        except Exception as e_parse:
            
            fallback_data = {}
            for k, v in schema_cls.model_fields.items():
                
                pattern = r'(?:\*\*)?(?:' + k + r'|' + k.replace('_', ' ').title() + r')(?:\*\*)?\s*:\s*(.*?)(?=(?:\*\*)?[A-Z][a-zA-Z\s_]+(?:\*\*)?\s*:|$)'
                match = re.search(pattern, content, re.IGNORECASE | re.DOTALL)
                if match:
                    val = match.group(1).strip()
                    ann_str = str(v.annotation).lower()
                    if 'list' in ann_str:
                        
                        val = [item.strip('- 1234567890.') for item in val.split('\n') if item.strip()]
                    fallback_data[k] = val
                else:
                    ann_str = str(v.annotation).lower()
                    fallback_data[k] = [] if 'list' in ann_str else ""
            
            
            if any(fallback_data.values()):
                data = fallback_data
            else:
                raise e_parse
        
        if isinstance(data, dict):
            
            if "properties" in data and isinstance(data["properties"], dict):
                data = data["properties"]
                
            
            for field_name, field_info in schema_cls.model_fields.items():
                if field_name in data:
                    val = data[field_name]
                    ann = field_info.annotation
                    
                    if ann is str and not isinstance(val, str):
                        if isinstance(val, dict) and "description" in val:
                            data[field_name] = str(val["description"])
                        elif isinstance(val, list):
                            data[field_name] = ", ".join(map(str, val))
                        else:
                            data[field_name] = str(val)
                    
                    elif isinstance(val, list):
                        flattened = []
                        for item in val:
                            if isinstance(item, dict):
                                
                                flattened.append(
                                    item.get("value") or item.get("description") or
                                    item.get("term") or item.get("text") or str(item)
                                )
                            else:
                                flattened.append(str(item))
                        data[field_name] = flattened

        return schema_cls(**data) if isinstance(data, dict) else schema_cls.model_validate(data)
        
    except Exception as e:
        error_msg = f"Failed to parse structured output. Error: {e}\nContent: {response.content if 'response' in locals() else 'N/A'}"
        logger.error(error_msg)
        with open("llm_error.log", "a", encoding="utf-8") as f:
            f.write(error_msg + "\n" + "-"*40 + "\n")
            
        
        default_data = {}
        for k, v in schema_cls.model_fields.items():
            ann_str = str(v.annotation).lower()
            default_data[k] = [] if 'list' in ann_str else "Information not available."
        return schema_cls(**default_data)
