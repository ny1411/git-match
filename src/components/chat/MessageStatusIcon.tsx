import { Check, CheckCheck } from 'lucide-react';
import type { FC } from 'react';
import type { ChatMessage } from '../../types/chat';

interface MessageStatusIconProps {
  status?: ChatMessage['status'];
}

const MessageStatusIcon: FC<MessageStatusIconProps> = ({ status }) => {
  if (!status) {
    return null;
  }

  if (status === 'read') {
    return <CheckCheck size={14} className="text-blue-400" />;
  }

  if (status === 'delivered') {
    return <CheckCheck size={14} className="text-gray-400" />;
  }

  return <Check size={14} className="text-gray-400" />;
};

export default MessageStatusIcon;
