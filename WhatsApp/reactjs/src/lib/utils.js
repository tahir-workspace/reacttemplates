export function formatMessageTime(date) {
  return new Date(date).toLocaleTimeString("en-US", {
    hour: "2-digit",
    minute: "2-digit",
    hour12: true,
  });
}

export function formatChatDate(dateString) {
  if (!dateString) return "";
  const date = new Date(dateString);
  const now = new Date();

  const isToday = date.toDateString() === now.toDateString();

  // Yesterday check
  const yesterday = new Date();
  yesterday.setDate(now.getDate() - 1);
  const isYesterday = date.toDateString() === yesterday.toDateString();

  // Difference in days
  const diffInDays = Math.floor((now - date) / (1000 * 60 * 60 * 24));

  if (isToday) {
    // 🕒 Today → 04:00 PM format (uppercase)
    return date
      .toLocaleTimeString([], {
        hour: "2-digit",
        minute: "2-digit",
        hour12: true,
      })
      .replace(/am|pm/, (m) => m.toUpperCase());
  } else if (isYesterday) {
    // 📅 Yesterday
    return "Yesterday";
  } else if (diffInDays < 7) {
    // 🗓 Within last week → full weekday (e.g., Tuesday)
    return date.toLocaleDateString([], { weekday: "long" });
  } else {
    // 📆 Older → MM/DD/YYYY
    return date.toLocaleDateString([], {
      month: "2-digit",
      day: "2-digit",
      year: "numeric",
    });
  }
}
