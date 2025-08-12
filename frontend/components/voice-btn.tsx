"use client";
import { useEffect, useState } from "react";


const VoiceInputButton = ({ setInput, selectedWorkflow }) => {
    const [isRecording, setIsRecording] = useState(false);
    const [recognition, setRecognition] = useState(null);


    useEffect(() => {
        const SpeechRecognition =
            window.SpeechRecognition || window.webkitSpeechRecognition;
        if (SpeechRecognition) {
            setRecognition(new SpeechRecognition());
        } else {
            console.warn("Speech Recognition API not supported in this browser.");
        }
    }, []);


    useEffect(() => {
        if (!recognition) return;


        recognition.lang = "en-US";
        recognition.interimResults = false;


        recognition.onstart = () => {
            setIsRecording(true);
        };


        recognition.onresult = (event) => {
            const transcript = event.results[0][0].transcript;
            setInput((prev) => `${prev} ${transcript}`.trim());
            stopRecording();
        };


        recognition.onerror = (event) => {
            console.error("Speech recognition error:", event.error);
            setIsRecording(false);
        };


        recognition.onend = () => {
            setIsRecording(false);
        };
    }, [recognition, setInput]);


    const startRecording = () => {
        if (recognition) {
            try {
                recognition.start();
            } catch (error) {
                console.error("Error starting recognition:", error);
                setIsRecording(false);
            }
        }
    };


    const stopRecording = () => {
        if (recognition && isRecording) {
            recognition.stop();
            setIsRecording(false);
        }
    };


    const handleVoiceInput = () => {
        if (!selectedWorkflow) return;
        if (isRecording) {
            stopRecording();
        } else {
            startRecording();
        }
    };


    return (
        <button onClick={handleVoiceInput} disabled={!selectedWorkflow}>
            {isRecording ? (
                <>
                    Stop <span className="sr-only">Voice Input</span>
                </>
            ) : (
                <>
                    Mic <span className="sr-only">Voice Input</span>
                </>
            )}
        </button>
    );
};


export default VoiceInputButton;
