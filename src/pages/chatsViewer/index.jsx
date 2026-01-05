import { supabase } from "@/services/supabaseClient";
import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";

const HandleChatsViewer = () => {
  const [incomingData, setIncomingData] = useState([]);

  const handleDataComing = async () => {
    const { data, error } = await supabase.from("directMessagesChannel")
      .select(`
      id,
      created_at,
      token,
      sender_id,
      receiver_id,
      sender:sender_id (
        id,
        full_name,
        avatar_url
      ),
      receiver:receiver_id (
        id,
        full_name,
        avatar_url
      )
    `).order("created_at", { ascending: false })


    if (error) {
      console.error("Supabase error:", error);
      return;
    }

    setIncomingData(data || []);
  };

  useEffect(() => {
    handleDataComing();
  }, []);

  return (
    <div className="bg-(--background) overflow-auto w-full font-bold text-(--primary-foreground) p-4">
      <h1
        className="mb-4 text-3xl
      "
      >
        Click to see chats
      </h1>
      {incomingData.length > 0 ? (
        incomingData.map((m, i) => (
          <div key={i} className="border-b overflow-auto border-(--chart-4)/20 py-2">
            <Link
              to={`/seePersonalChats/${m.token}`}
              className="text-(--secondary-foreground) font-normal"
            >
              Chat between {""}
              <span className="font-bold">
                {m?.receiver?.full_name}
              </span> and {""}
              <span className="font-bold">{m?.sender?.full_name}</span>
            </Link>
          </div>
        ))
      ) : (
        <p>No chats found.</p>
      )}
    </div>
  );
};

export default HandleChatsViewer;
