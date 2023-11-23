import { usePathname } from 'next/navigation';
import { useMemo } from 'react';
import { HiChat } from 'react-icons/hi';
import { HiArrowLeftOnRectangle, HiUsers } from 'react-icons/hi2';

import { signOut } from 'next-auth/react';
import useConversation from './useConversation';

const useRoutes = () => {
    const pathName = usePathname();

    const { conversationId } = useConversation();

    const routes = useMemo(() => [
        // Chat
        {
            label: 'Chat',
            href: '/conversations',
            icon: HiChat,
            active: pathName === '/conversations' || !!conversationId
        },

        // Users
        {
            label: 'Users',
            href: '/users',
            icon: HiUsers,
            active: pathName === '/users'
        },

        // Logout
        {
            label: 'Logout',
            href: '#',
            onClick: () => signOut(),
            icon: HiArrowLeftOnRectangle
        }
    ], [pathName, conversationId]);

    return routes;
}

export default useRoutes;