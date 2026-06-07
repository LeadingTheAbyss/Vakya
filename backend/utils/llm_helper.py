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
    # Append the strict JSON requirement and schema to the system prompt
    # Simplify schema to prevent 1B models from hallucinating "properties" or "title" wrappers
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
        # If no system prompt, add one at the beginning
        messages.insert(0, ("system", instruction))
        
    try:
        # We can ask LangChain to force JSON format from Ollama if supported
        response = llm.bind(format="json").invoke(messages)
            
        content = response.content
        
        # 1. Strip <think> tags completely
        content = re.sub(r'<think>.*?</think>', '', content, flags=re.DOTALL)
        
        # 2. Find the first '{' and last '}' to extract pure JSON
        start_idx = content.find('{')
        end_idx = content.rfind('}')
        
        if start_idx != -1 and end_idx != -1 and end_idx >= start_idx:
            json_str = content[start_idx:end_idx + 1]
        else:
            json_str = content
            
        from langchain_core.output_parsers import JsonOutputParser
        parser = JsonOutputParser()
        data = parser.parse(json_str)
        
        if isinstance(data, dict):
            # Unwrap if model hallucinated a "properties" wrapper
            if "properties" in data and isinstance(data["properties"], dict):
                data = data["properties"]
                
            # Flatten lists/dicts to strings if schema expects a string
            for field_name, field_info in schema_cls.model_fields.items():
                if field_name in data:
                    val = data[field_name]
                    ann = field_info.annotation
                    # If field expects string but got list/dict, convert it
                    if ann is str and not isinstance(val, str):
                        if isinstance(val, dict) and "description" in val:
                            data[field_name] = str(val["description"])
                        elif isinstance(val, list):
                            data[field_name] = ", ".join(map(str, val))
                        else:
                            data[field_name] = str(val)
                    # If field expects list[str] but items are dicts, flatten each item
                    elif isinstance(val, list):
                        flattened = []
                        for item in val:
                            if isinstance(item, dict):
                                # Extract most meaningful string value from the dict
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
        raise e
