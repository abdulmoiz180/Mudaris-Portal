import React, { useEffect, useState, Suspense } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Button } from "@/components/ui/button";
import ChapterDialog from "@/components/Dialogs/ChannelsDialog/Videos&Presentations/Chapters";
import VideoDialog from "@/components/Dialogs/ChannelsDialog/Videos&Presentations/Videos";
import {
  deleteChapterDB,
  fetchChapters,
} from "@/redux/features/video&presentations/chapterSlice";
import {
  deleteVideoDB,
  fetchVideos,
} from "@/redux/features/video&presentations/videoSlice";
import { useParams } from "react-router-dom";
import { ChevronDown, ChevronUp, PlayCircle } from "lucide-react";
import { useIsAdmin } from "@/constants/constants.js";
import Actions from "../actions/index.jsx";
import "./responsive.css";
const VideoComponent = React.lazy(() => import("./VideoComponent.jsx"));

const VideosPresentations = () => {
  const isAdmin = useIsAdmin();

  const dispatch = useDispatch();
  const { workspace_id } = useParams();
  // CACHED chapters (by workspace)
  const chapters =
    useSelector((state) => state.chapters.chaptersByWorkspace[workspace_id]) ||
    [];

  // CACHED videos (by chapter)
  const videosByChapter = useSelector((state) => state.videos.videosByChapter);

  const [expandedChapter, setExpandedChapter] = useState(null);
  const [selectedVideo, setSelectedVideo] = useState(null);
  const [chapterDialogOpen, setChapterDialogOpen] = useState(false);
  const [videoDialogOpen, setVideoDialogOpen] = useState(false);
  const [activeChapter, setActiveChapter] = useState(null);
  const [editingChapter, setEditingChapter] = useState(null);
  const [editingVideo, setEditingVideo] = useState(null);

  // Fetch chapters (only once thanks to caching)
  useEffect(() => {
    dispatch(fetchChapters(workspace_id));
  }, [workspace_id, dispatch]);

  const handleSeeVideos = (chapterId) => {
    const cached = videosByChapter[chapterId];

    if (!cached) {
      dispatch(fetchVideos(chapterId));
    }

    setExpandedChapter((prev) => (prev === chapterId ? null : chapterId));
  };

  const handleDialogChange = (isOpen) => {
    setChapterDialogOpen(isOpen);
    if (!isOpen) setEditingChapter(null);
  };

  const onEdit = (chapter) => {
    setEditingChapter(chapter);
    setChapterDialogOpen(true);
  };

  const onDelete = (id) => dispatch(deleteChapterDB(id));
  const onDeleteVideo = (id) => dispatch(deleteVideoDB(id));
  const handleAddVideo = (chapterId) => {
    setActiveChapter(chapterId);
    setEditingVideo("");
    setVideoDialogOpen(true);
  };
  const handleEditingVideo = (video, chapterId) => {
    setActiveChapter(chapterId);
    setEditingVideo(video);
    setVideoDialogOpen(true);
  };
  return (
    <div className="bg-(--background) responsive-video-presentation-container  text-(--foreground) p-4 flex flex-col gap-6">
      {isAdmin && (
        <div className="flex w-full justify-center">
          <Button
            className=" "
            variant="secondary"
            onClick={() => setChapterDialogOpen(true)}
          >
            Add Chapter
          </Button>
        </div>
      )}
      {chapters && chapters.length > 0 ? (
        <div className="flex responsive-video-left-sidebar">
          {/* LEFT SIDEBAR */}
          <div
            className="mt-4 w-[35%] responsive-video-left-component h-[80vh] overflow-y-scroll scroll-smooth 
  [scrollbar-width:auto] 
  [&::-webkit-scrollbar]:w-2
  [&::-webkit-scrollbar-track]:bg-(--sidebar-primary) 
  [&::-webkit-scrollbar-thumb]:bg-(--sidebar-primary) 
  [&::-webkit-scrollbar-thumb]:rounded-full"
          >
            {chapters.map((chapter, idx) => {
              const chapterVideos = videosByChapter[chapter.id] || [];

              return (
                <div key={chapter.id} className="flex flex-col relative">
                  {/* Chapter Header */}
                  <div
                    className="flex p-4 gap-1 hover:bg-(--sidebar-accent)
                            items-center border-2 border-(--sidebar-border)"
                  >
                    <Button
                      onClick={() => handleSeeVideos(chapter.id)}
                      variant={"ghost"}
                    >
                      {expandedChapter === chapter.id ? (
                        <ChevronUp className="w-6 h-6" />
                      ) : (
                        <ChevronDown className="w-6 h-6" />
                      )}
                    </Button>

                    <h2 className="text-lg">
                      {idx + 1}. {chapter.name}
                    </h2>

                    {isAdmin && (
                      <div className="flex h-full justify-end absolute right-4">
                        <Actions
                          onEdit={() => onEdit(chapter)}
                          onAdd={() => handleAddVideo(chapter.id)}
                          onDelete={() => onDelete(chapter.id)}
                        />
                      </div>
                    )}
                  </div>

                  {/* Videos */}
                  {expandedChapter === chapter.id && (
                    <ul className="space-y-1 bg-(--border)">
                      {chapterVideos.map((video, i) => (
                        <li
                          key={video.id}
                          className="text-sm text-(--muted-foreground)
                              hover:bg-(--sidebar-accent) p-4 px-6
                              flex gap-2 cursor-pointer justify-between"
                          onClick={() =>
                            setSelectedVideo({
                              video,
                              index: i,
                              allVideos: chapterVideos,
                              chp: chapter.name,
                            })
                          }
                        >
                          <div className="flex gap-2 items-center">
                            <PlayCircle className="h-5 w-5" />
                            <strong className="text-base">
                              {i + 1}. {video.name}
                            </strong>
                          </div>
                          {isAdmin && (
                            <Actions
                              onEdit={() =>
                                handleEditingVideo(video, chapter.id)
                              }
                              onDelete={() => onDeleteVideo(video.id)}
                            />
                          )}
                        </li>
                      ))}

                      {chapterVideos.length === 0 && (
                        <li className="p-4 text-sm opacity-50 italic">
                          No videos yet.
                        </li>
                      )}
                    </ul>
                  )}
                </div>
              );
            })}
          </div>

          {/* RIGHT SIDE PLAYER */}
          <Suspense fallback={<div>Loading video...</div>}>
            {selectedVideo && (
              <VideoComponent data={selectedVideo} onNext={setSelectedVideo} />
            )}
          </Suspense>
        </div>
      ) : (
        <h1 className="text-center h-dvh text-5xl">There are no Videos</h1>
      )}

      {/* Dialogs */}
      <ChapterDialog
        open={chapterDialogOpen}
        editingData={editingChapter}
        onOpenChange={handleDialogChange}
      />

      {activeChapter && (
        <VideoDialog
          chapterId={activeChapter}
          editingData={editingVideo}
          open={videoDialogOpen}
          onOpenChange={setVideoDialogOpen}
        />
      )}
    </div>
  );
};

export default VideosPresentations;
