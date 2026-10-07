import {FunctionComponent, PropsWithChildren} from "react";
import {Button} from "antd";

type EditorIconProps = PropsWithChildren & {
    onClick?: () => void;
    title?: string
}

const EditorIcon: FunctionComponent<EditorIconProps> = ({onClick, title, children}) => {
    return (
        <Button
            title={title}
            icon={children}
            onClick={onClick}
            type={"text"}
            style={{
                width: 38,
                display: "flex",
                alignItems: "center",
                fontSize: 20,
                border: "none",
                height: 38,
                color: "inherit",
                borderRadius: 0,
                padding: 0,
                justifyContent: "center",
            }}
        >
        </Button>
    );
};
export default EditorIcon;
