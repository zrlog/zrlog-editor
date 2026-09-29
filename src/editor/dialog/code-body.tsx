import FormItem from "antd/es/form/FormItem";
import BaseTextArea from "../common/BaseTextArea";
import Select from "antd/es/select";
import { FunctionComponent, useEffect, useState } from "react";
import { getCodeLanguages } from "../highlight/hljs-helpers";
import { getEditorRes } from "../lang/editor-lang";
import { createFencedCodeBlock } from "../../markdown/fenced-code";

type CodeBodyProps = {
    onChange: (content: string) => void;
    getContainer?: () => HTMLElement;
};

type CodeBodyState = {
    language: string;
    code: string;
};

const CodeBody: FunctionComponent<CodeBodyProps> = ({ onChange, getContainer }) => {
    const [state, setState] = useState<CodeBodyState>({
        language: "",
        code: "",
    });

    const languages = getCodeLanguages();

    useEffect(() => {
        if (state.code.length === 0) {
            return;
        }
        onChange(createFencedCodeBlock(state.code, state.language));
    }, [state]);

    return (
        <>
            <FormItem label={getEditorRes("lang")}>
                <Select
                    style={{ maxWidth: 240 }}
                    onChange={(k) => {
                        setState((prevState) => {
                            return {
                                ...prevState,
                                language: k,
                            };
                        });
                    }}
                    getPopupContainer={getContainer}
                >
                    {Object.keys(languages).map((key) => (
                        <Select.Option key={key} value={key}>
                            {languages[key][0]}
                        </Select.Option>
                    ))}
                </Select>
            </FormItem>
            <FormItem>
                <BaseTextArea
                    placeholder={""}
                    onChange={(v) => {
                        setState((prevState) => {
                            return {
                                ...prevState,
                                code: v,
                            };
                        });
                    }}
                    minRows={12}
                    maxRows={25}
                />
            </FormItem>
        </>
    );
};
export default CodeBody;
