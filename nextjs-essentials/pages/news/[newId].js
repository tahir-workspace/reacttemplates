import { useRouter } from "next/router";

function NewsDetail() {
  const router = useRouter();
  const { newId } = router.query;
  const newsItem = {
    title: "Sample News Title",
    content: "This is the content of the news item with ID: " + newId,
  };
  return (
    <div>
      <h1>{newsItem.title}</h1>
      <p>{newsItem.content}</p>
    </div>
  );
}

export default NewsDetail;
