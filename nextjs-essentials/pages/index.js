import Link from "next/link";

function Home() {
  const DUMMY_MEETUPS = [
    {
      id: "m1",
      title: "A First Meetup",
      image:
        "https://www.alliedmachinerysales.com/assets/subdomain/alliedmachinery/images/lift-equipment.webp",
      address: "123 NextJs Street, Framework City",
      description: "This is a first meetup description",
    },
    {
      id: "m2",
      title: "A Second Meetup",
      image:
        "https://www.alliedmachinerysales.com/assets/subdomain/alliedmachinery/images/lift-equipment.webp",
      address: "456 React Avenue, Library Town",
      description: "This is a second meetup description",
    },
    {
      id: "m3",
      title: "A Third Meetup",
      image:
        "https://www.alliedmachinerysales.com/assets/subdomain/alliedmachinery/images/lift-equipment.webp",
      address: "789 Vue Boulevard, Framework Village",
      description: "This is a third meetup description",
    },
  ];

  return (
    <div>
      <h1>Welcome to My Page</h1>
      <p>This is the home page of my website.</p>
      <ul>
        <li>
          <Link href="/news/next-js-is-great-framework">
            NextJs is Great Framework
          </Link>
        </li>
      </ul>
    </div>
  );
}

export default Home;
