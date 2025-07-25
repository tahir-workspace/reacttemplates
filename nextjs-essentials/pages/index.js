import Link from "next/link";
import MeetupList from "../components/meetups/MeetupList";

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
      <MeetupList meetups={DUMMY_MEETUPS} />
    </div>
  );
}

export default Home;
