import { useEffect } from "react";

export default function useDualScroll({
  scrollRef,
  setPage,
  setScrollToBottom,
  hasMore,
  isLoading,
}) {
  useEffect(() => {
    console.log("scroll detail:", hasMore, isLoading);
    //console.log("scrollRef.current2:", scrollRef.current);
    const handleWindowScroll = () => {
      const doc = document.documentElement;
      const scrollTop = doc.scrollTop || document.body.scrollTop;
      const scrollHeight = doc.scrollHeight - doc.clientHeight;
      const scrollPercent = (scrollTop / scrollHeight) * 100;

      setScrollToBottom(scrollPercent < 80);

      if (!hasMore) return;

      // Load previous page when near top
      if (window.scrollY < 10 && !isLoading) {
        setPage((prev) => prev + 1);
      }
    };

    const handleDivScroll = () => {
      const div = scrollRef?.current;
      if (!div) return;

      const { scrollTop, scrollHeight, clientHeight } = div;
      const scrollPercent = (scrollTop / (scrollHeight - clientHeight)) * 100;

      setScrollToBottom(scrollPercent < 80);

      if (!hasMore) return;

      // If scrolled to top of the div
      if (scrollTop < 10 && !isLoading) {
        setPage((prev) => prev + 1);
      }
    };

    const div = scrollRef?.current;

    // 🖥 Desktop (window scroll)
    window.addEventListener("scroll", handleWindowScroll, { passive: true });

    // 📱 Mobile (scrollable div)
    if (div) div.addEventListener("scroll", handleDivScroll, { passive: true });

    return () => {
      window.removeEventListener("scroll", handleWindowScroll);
      if (div) div.removeEventListener("scroll", handleDivScroll);
    };
  }, [scrollRef.current, setPage, setScrollToBottom, hasMore, isLoading]);
}
