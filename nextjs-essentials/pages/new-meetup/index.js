import NewMeetupForm from "@/components/meetups/NewMeetupForm";

function newMeetupPage() {
  function submitHandler(meetupData) {
    console.log(meetupData);
  }

  return (
    <div>
      <NewMeetupForm onAddMeetup={submitHandler} />
    </div>
  );
}

export default newMeetupPage;
