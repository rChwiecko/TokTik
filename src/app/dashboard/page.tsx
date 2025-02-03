import { auth } from "@clerk/nextjs/server";
import VideoPlayer from "./VideoPlayer";

export default async function Dashboard() {
  const { userId } = await auth();

  return (
    <div className="relative min-h-screen overflow-hidden">
      {userId && (
        <>
          {/* Pass the video data or any other props */}
          <VideoPlayer />
        </>
      )}
    </div>
  );
}
