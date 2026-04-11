import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import React from "react";
const ChildList = () => {
    const [children, setChildren] = React.useState([]);
    const addChild = (child) => {
        setChildren([...children, child]);
    };
    const removeChild = (child) => {
        setChildren(children.filter((c) => c !== child));
    };
    return (_jsxs("div", { children: [_jsx("h1", { children: "Child Profiles" }), _jsx("ul", { children: children.map((child, index) => (_jsxs("li", { children: [child, " ", _jsx("button", { onClick: () => removeChild(child), children: "Remove" })] }, index))) }), _jsx("button", { onClick: () => addChild(prompt("Enter child name:") || ""), children: "Add Child" })] }));
};
export default ChildList;
