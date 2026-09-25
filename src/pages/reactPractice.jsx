import { useState } from "react";

function ReactPractice() {
    const [count, setCount] = useState(0);
    const [name, setName] = useState("");
    const [isVisible, setIsVisible] = useState(false);

    return (
        <div>
            <div>
                <button onClick={() => setCount(count + 1)}>Increase</button>
                <button onClick={() => setCount(count - 1)}>Decrease</button>
                <button onClick={() => setCount(0)}>Reset</button>
            </div>

            <div>
                <input
                    type="text"
                    placeholder="enter your name"
                    onChange={(e) => setName(e.target.value)}
                />
                <p>Your name is: {name}</p>
            </div>

            <div>
                <button onClick={() => setIsVisible(!isVisible)}>
                    {isVisible ? "Hide" : "Show"}
                </button>
                {isVisible && <p>This text is visible</p>}
            </div>
        </div>
    );
}

export default ReactPractice;