export type Message = {
  id: string;
  content: string;
  created_at: string;
  sender_id: string;
  room_id: string;
  message_type: 1 | 2;
  role: 1 | 2;
}

export type TempMessage = Message & {
  tempId?: string;
  sending?: boolean;
};

export type Room = {
  id: string;
  name: string;
  created_at: string;
  creator_id: string;
  is_private: string;
}

export type Participant = {
  id: string;
  name: string;
  created_at: string;
  user_id: string;
  room_id: string;
}