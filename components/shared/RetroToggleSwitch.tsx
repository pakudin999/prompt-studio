import React from 'react';

export const RetroToggleSwitch = ({ id, checked, onChange }: { id: string, checked: boolean, onChange: (e: any) => void }) => (
    React.createElement('div', { className: "toggle-container" },
        React.createElement('input', { id: id, className: "toggle-input", type: "checkbox", checked: checked, onChange: onChange }),
        React.createElement('div', { className: "toggle-handle-wrapper" },
            React.createElement('div', { className: "toggle-handle" },
                React.createElement('div', { className: "toggle-handle-knob" }),
                React.createElement('div', { className: "toggle-handle-bar-wrapper" },
                    React.createElement('div', { className: "toggle-handle-bar" })
                )
            )
        ),
        React.createElement('div', { className: "toggle-base" },
            React.createElement('div', { className: "toggle-base-inside" })
        )
    )
);
