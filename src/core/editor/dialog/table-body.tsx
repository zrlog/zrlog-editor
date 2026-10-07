import {EditorGlyph} from "../../../icons";
import { InputNumber, Radio } from "antd";
import { useEffect, useState } from "react";
import FormItem from "antd/es/form/FormItem";
import { getEditorRes } from "../../../editor/lang/editor-lang";

type TableState = {
    rows: number;
    cols: number;
    align: "left" | "center" | "right" | "_default";
};

const TableBody = ({ onChange }: { onChange: (value: string) => void }) => {
    const [state, setState] = useState<TableState>({ rows: 0, cols: 0, align: "_default" });

    const change = () => {
        const align = state.align;
        const hrLine = "------------";

        const alignSign = {
            _default: hrLine,
            left: ":" + hrLine,
            center: ":" + hrLine + ":",
            right: hrLine + ":",
        };

        let table = "\n\n";
        if (state.rows > 1 && state.cols > 0) {
            let r = 0;
            const len = state.rows;
            for (; r < len; r++) {
                const row = [];
                const head = [];

                let c = 0;
                const len2 = state.cols;
                for (; c < len2; c++) {
                    if (r === 1) {
                        head.push(alignSign[align] as never);
                    }

                    row.push(" " as never);
                }

                if (r === 1) {
                    table += "| " + head.join(" | ") + " |" + "\n";
                }
                table += "| " + row.join(state.cols === 1 ? "" : " | ") + " |" + "\n";
            }
        }
        onChange(table);
    };

    useEffect(() => {
        if (state.rows < 1 || state.cols < 1) {
            return;
        }
        change();
    }, [state]);

    return (
        <div style={{ paddingTop: 12 }}>
            <div style={{ display: "flex", gap: 16 }}>
                <FormItem label={getEditorRes("row")}>
                    <InputNumber controls={{upIcon: <EditorGlyph name="up"/>, downIcon: <EditorGlyph name="down"/>}}
                        min={2}
                        onChange={(e) => {
                            setState((prevState) => {
                                return {
                                    ...prevState,
                                    rows: e as number,
                                };
                            });
                        }}
                    />
                </FormItem>
                <FormItem label={getEditorRes("col")}>
                    <InputNumber controls={{upIcon: <EditorGlyph name="up"/>, downIcon: <EditorGlyph name="down"/>}}
                        min={1}
                        title={getEditorRes("col")}
                        onChange={(e) => {
                            setState((prevState) => {
                                return {
                                    ...prevState,
                                    cols: e as number,
                                };
                            });
                        }}
                    />
                </FormItem>
            </div>
            <div>
                <FormItem label={getEditorRes("algin")}>
                    <Radio.Group
                        value={state.align}
                        onChange={(e) => {
                            setState((prevState) => {
                                return {
                                    ...prevState,
                                    align: e.target.value,
                                };
                            });
                        }}
                    >
                        <Radio value={"left"}>
                            <EditorGlyph name="alignLeft" selected={state.align === "left"} />
                            <span style={{ paddingLeft: 4 }}>{getEditorRes("left")}</span>
                        </Radio>
                        <Radio value={"center"}>
                            <EditorGlyph name="alignCenter" selected={state.align === "center"} />
                            <span style={{ paddingLeft: 4 }}>{getEditorRes("center")}</span>
                        </Radio>
                        <Radio value={"right"}>
                            <EditorGlyph name="alignRight" selected={state.align === "right"} />
                            <span style={{ paddingLeft: 4 }}>{getEditorRes("right")}</span>
                        </Radio>
                    </Radio.Group>
                </FormItem>
            </div>
        </div>
    );
};
export default TableBody;
