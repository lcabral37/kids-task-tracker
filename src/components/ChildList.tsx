import React from 'react';

const ChildList: React.FC = () => {
    const [children, setChildren] = React.useState<string[]>([]);

    const addChild = (child: string) => {
        setChildren([...children, child]);
    };

    const removeChild = (child: string) => {
        setChildren(children.filter(c => c !== child));
    };

    return (
        <div>
            <h1>Child Profiles</h1>
            <ul>
                {children.map((child, index) => (
                    <li key={index}>
                        {child} <button onClick={() => removeChild(child)}>Remove</button>
                    </li>
                ))}
            </ul>
            <button onClick={() => addChild(prompt('Enter child name:') || '')}>Add Child</button>
        </div>
    );
};

export default ChildList;
