import NotesList from "@/components/NotesList";
import NotesPage from "./notes/page";


export default function Home() {
  return (
    <>
    <NotesPage />
     <div className="p-6">
      <NotesList />
    </div>
    </>
  );
}
