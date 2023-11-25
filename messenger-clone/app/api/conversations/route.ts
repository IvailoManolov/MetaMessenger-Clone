import getCurrentUser from "@/app/actions/getCurrentUser";
import { NextResponse } from 'next/server';
import prisma from '@/app/libs/prismadb';

export async function POST(
    request: Request
) {
    try {
        const currentUser = await getCurrentUser();

        const body = await request.json();

        const {
            userId,
            isGroup,
            members,
            name
        } = body;

        if (!currentUser?.id || !currentUser?.email) {
            return new NextResponse("Unauthorized", { status: 401 });
        }

        if (isGroup && (!members || members.length < 2 || !name)) {
            return new NextResponse("Invalid data", { status: 400 });
        }

        if (isGroup) {
            const newConversation = await prisma.conversation.create({
                data: {
                    name,
                    isGroup,
                    users: {
                        // Add the members ID's because we need them for the relation.
                        connect: [
                            ...members.map((member: { value: string }) => ({
                                id: member.value
                            })),
                            //Seperately add the persons id, who is creating the group.
                            {
                                id: currentUser.id
                            }
                        ]
                    }
                },
                include: {
                    users: true
                }
            });

            return NextResponse.json(newConversation);
        }

        // This means that we are not having a group. Check for an existing convo.
        const existingConversations = await prisma.conversation.findMany({
            where: {
                OR: [
                    {
                        userIds: {
                            equals: [currentUser.id, userId]
                        }
                    },
                    {
                        userIds: {
                            equals: [userId, currentUser.id]
                        }
                    }
                ]
            }
        });

        const singleConersation = existingConversations[0];

        if (singleConersation) {
            return NextResponse.json(singleConersation);
        }

        // Conversation between the 2 users doesn't exist. Make one!
        const newConversation = await prisma.conversation.create({
            data: {
                users: {
                    connect: [
                        {
                            id: currentUser.id
                        },
                        {
                            id: userId
                        }
                    ]
                }
            },
            include: {
                users: true
            }
        });

        return NextResponse.json(newConversation);

    } catch (error: any) {
        return new NextResponse("Internal Error", { status: 500 });
    }
}
