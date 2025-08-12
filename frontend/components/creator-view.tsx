"use client";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Bot, Network, RefreshCw, Send, User } from "lucide-react";
import { useEffect, useRef, useState } from "react";

interface Message {
  id: string;
  role: "user" | "assistant" | "system";
  content: string;
  timestamp: string;
}

export function ChatbotView() {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: "1",
      role: "system",
      content:
        "Welcome to the AI Agent Creator! What type of AI agent would you" +
        " like to create today?",
      timestamp: new Date().toISOString(),
    },
  ]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleSendMessage = async () => {
    if (!input.trim()) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      role: "user",
      content: input,
      timestamp: new Date().toISOString(),
    };

    setMessages((prev) => [...prev, userMessage]);
    setInput("");
    setIsLoading(true);

    try {
      const response = await fetch(
        `http://localhost:8000/generate/?prompt=${encodeURIComponent(input)}`,
        {
          method: "GET",
          headers: {
            accept: "application/json",
          },
        }
      );

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      const assistantMessage: Message = {
        id: Date.now().toString(),
        role: "assistant",
        content: JSON.stringify(data, null, 2), // Display JSON nicely
        timestamp: new Date().toISOString(),
      };
      setMessages((prev) => [...prev, assistantMessage]);
    } catch (error) {
      console.error("Error sending message:", error);
      const errorAssistantMessage: Message = {
        id: Date.now().toString(),
        role: "assistant",
        content: "Sorry, I encountered an error processing your request.",
        timestamp: new Date().toISOString(),
      };
      setMessages((prev) => [...prev, errorAssistantMessage]);
    } finally {
      setIsLoading(false);
      setTimeout(() => {
        window.location.href = "http://localhost:3000/marketplace";
      }, 3000);
    }
  };

  const formatTime = (timestamp: string) => {
    const date = new Date(timestamp);
    return date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
  };

  return (
    <div className="container mx-auto p-6 w-full">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 w-full">
        <div className="md:col-span-2">
          <Card className="h-[calc(100vh-12rem)] w-full">
            <CardHeader className="border-b p-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Avatar>
                    <AvatarImage src="/placeholder.svg?height=40&width=40" />
                    <AvatarFallback>
                      <Network />
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <h2>AI Agent Creator</h2>
                  </div>
                </div>
              </div>
            </CardHeader>
            <CardContent className="p-0">
              <div className="h-[calc(100vh-16rem)] overflow-y-auto p-4">
                {messages.map((message) => (
                  <div
                    key={message.id}
                    className={`mb-4 flex ${message.role === "user" ? "justify-end" : "justify-start"
                      }`}
                  >
                    {message.role !== "user" && (
                      <div className="mr-2 flex h-8 w-8 items-center justify-center rounded-full bg-primary text-primary-foreground">
                        {message.role === "system" ? (
                          <Network size={16} />
                        ) : (
                          <Bot size={16} />
                        )}
                      </div>
                    )}
                    <div
                      className={`max-w-[80%] rounded-lg px-4 py-2 ${message.role === "user"
                        ? "bg-primary text-primary-foreground"
                        : message.role === "system"
                          ? "bg-muted text-muted-foreground"
                          : "bg-secondary text-secondary-foreground"
                        }`}
                    >
                      <div className="mb-1">
                        {message.content}
                      </div>
                      <div className="text-xs opacity-70 text-right">
                        {formatTime(message.timestamp)}
                      </div>
                    </div>
                    {message.role === "user" && (
                      <div className="ml-2 flex h-8 w-8 items-center justify-center rounded-full bg-primary text-primary-foreground">
                        <User size={16} />
                      </div>
                    )}
                  </div>
                ))}
                {isLoading && (
                  <div className="flex justify-start mb-4">
                    <div className="mr-2 flex h-8 w-8 items-center justify-center rounded-full bg-primary text-primary-foreground">
                      <Bot size={16} />
                    </div>
                    <div className="max-w-[80%] rounded-lg bg-secondary text-secondary-foreground px-4 py-2">
                      <div className="flex items-center gap-2">
                        <RefreshCw className="h-4 w-4 animate-spin" />
                        <span>Thinking...</span>
                      </div>
                    </div>
                  </div>
                )}
                <div ref={messagesEndRef} />
              </div>
            </CardContent>
            <CardFooter className="border-t p-4">
              <div className="flex w-full items-center gap-2">
                <Input
                  placeholder="Describe the AI agent you want to create..."
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" && !e.shiftKey) {
                      e.preventDefault();
                      handleSendMessage();
                    }
                  }}
                />
                <Button onClick={handleSendMessage} disabled={!input.trim()}>
                  <Send className="h-4 w-4" />
                  <span className="sr-only">Send</span>
                </Button>
              </div>
            </CardFooter>
          </Card>
        </div>
      </div>
    </div>
  );
}
