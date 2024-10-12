import { auth, clerkClient } from "@clerk/nextjs/server";
import { DocumentManagement } from "@/components/document-management";
import redis from "@/lib/redis";
import { UserButton } from "@clerk/nextjs";

export default async function DocumentsPage() {
  const { userId } = auth();

  if (!userId) {
    return <div>Please sign in to view your documents.</div>;
  }

  const user = await clerkClient().users.getUser(userId);
  const documentIds = (user.publicMetadata.documents as string[]) || [];

  // Fetch documents from Redis
  const documents = await Promise.all(
    documentIds.map(async (id) => {
      const doc = await redis.get(id);
      if (doc) {
        const parsedDoc = JSON.parse(doc);
        return { id, ...parsedDoc };
      }
      return null;
    })
  );

  const validDocuments = documents.filter(
    (doc): doc is NonNullable<typeof doc> => doc !== null
  );

  async function deleteDocument(documentId: string) {
    "use server";

    // Delete the document from Redis
    await redis.del(documentId);

    // Get the current user
    const user = await clerkClient().users.getUser(userId);

    // Get the current documents array from publicMetadata
    const currentDocuments = (user.publicMetadata.documents as string[]) || [];

    // Remove the deleted document ID from the array
    const updatedDocuments = currentDocuments.filter((id) => id !== documentId);

    // Update the user's publicMetadata with the new documents array
    await clerkClient().users.updateUser(userId, {
      publicMetadata: {
        ...user.publicMetadata,
        documents: updatedDocuments,
      },
    });

    console.log(`Document ${documentId} deleted for user ${userId}`);
  }

  return (
    <div className="container mx-auto p-4">
      <div className="flex justify-between items-center mb-4">
        <h1 className="text-2xl font-bold">Your Documents</h1>
        <UserButton afterSignOutUrl="/" />
      </div>
      <DocumentManagement
        deleteDocument={deleteDocument}
        initialDocuments={validDocuments}
      />
    </div>
  );
}
