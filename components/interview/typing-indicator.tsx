export function TypingIndicator() {
  return (
    <div className="flex w-full mb-4 justify-start">
      <div className="max-w-[80%] rounded-2xl rounded-bl-sm px-4 py-3 bg-gray-100 dark:bg-gray-800">
        <div className="flex space-x-2">
          <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce [animation-delay:-0.3s]"></div>
          <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce [animation-delay:-0.15s]"></div>
          <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
        </div>
      </div>
    </div>
  );
}
