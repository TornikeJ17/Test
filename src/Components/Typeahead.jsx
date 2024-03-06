import React, { useState, useEffect, useRef } from "react";
import useDebounce from "./useDebounce";
import "./Typeahead.css";

const Typeahead = () => {
    const [input, setInput] = useState("");
    const [users, setUsers] = useState([]);
    const [showSuggestions, setShowSuggestions] = useState(false);
    const debouncedSearchTerm = useDebounce(input, 500);
    const inputRef = useRef(null);
    const suggestionsRef = useRef(null);

    useEffect(() => {
        if (debouncedSearchTerm) {
            setShowSuggestions(true);
            const API_URL = `https://api.github.com/search/users?q=${encodeURIComponent(
                debouncedSearchTerm
            )}`;
            fetch(API_URL)
                .then((response) => response.json())
                .then((results) => {
                    const filteredUsers = (results.items || []).filter((user) =>
                        user.login
                            .toLowerCase()
                            .startsWith(debouncedSearchTerm.toLowerCase())
                    );
                    setUsers(filteredUsers);
                })
                .catch((error) => {
                    console.error(error);
                    setUsers([]);
                });
        } else {
            setUsers([]);
            setShowSuggestions(false);
        }
    }, [debouncedSearchTerm]);

    useEffect(() => {
        const handleClickOutside = (event) => {
            if (
                suggestionsRef.current &&
                !suggestionsRef.current.contains(event.target) &&
                !inputRef.current.contains(event.target)
            ) {
                setShowSuggestions(false);
            }
        };

        document.addEventListener("mousedown", handleClickOutside);
        return () => {
            document.removeEventListener("mousedown", handleClickOutside);
        };
    }, []);

    const handleChange = (e) => {
        setInput(e.target.value);
    };

    const handleSelectUser = (user) => {
        setInput(user.login);
        setShowSuggestions(false);
    };

    const handleKeyDown = (e) => {
        if (e.key === "Enter" && users.length > 0) {
            handleSelectUser(users[0]);
        }
    };

    const highlightMatch = (userLogin) => {
        if (userLogin.toLowerCase().startsWith(input.toLowerCase())) {
            const matchEndIndex = input.length;
            return (
                <div>
                    <strong>{userLogin.substring(0, matchEndIndex)}</strong>
                    <span style={{ color: "grey" }}>
                        {userLogin.substring(matchEndIndex)}
                    </span>
                </div>
            );
        } else {
            return userLogin;
        }
    };

    return (
        <div className="typeahead-container">
            <input
                ref={inputRef}
                className="typeahead-input"
                type="text"
                value={input}
                onChange={handleChange}
                placeholder={"Search Github Users"}
                onKeyDown={handleKeyDown}
                onFocus={() => setShowSuggestions(true)}
            />
            {showSuggestions && users.length > 0 && (
                <div
                    className="typeahead-results"
                    ref={suggestionsRef}
                    role="list"
                >
                    {users.map((user) => (
                        <a
                            key={user.id}
                            href={user.html_url}
                            target="_blank"
                            rel="noopener noreferrer"
                        >
                            <div
                                className="typeahead-item"
                                onClick={() => handleSelectUser(user)}
                                role="listitem"
                            >
                                <img
                                    src={user.avatar_url}
                                    alt={`Avatar of ${user.login}`}
                                    className="UserAvatar"
                                />
                                {highlightMatch(user.login)}
                            </div>
                        </a>
                    ))}
                </div>
            )}
        </div>
    );
};

export default Typeahead;
