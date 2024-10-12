import { useUser } from "@clerk/nextjs";
import { useEffect, useState } from "react";

export function UserDocuments() {
  const { user } = useUser();
  const [documents, setDocuments] = useState<string[]>([]);

  useEffect(() => {
    if (user && user.publicMetadata) {
      const userDocuments = user.publicMetadata.documents as
        | string[]
        | undefined;
      setDocuments(userDocuments || []);
    }
  }, [user]);

  return (
    <div>
      <h2>Your Documents</h2>
      <ul>
        {documents.map((docId) => (
          <li key={docId}>{docId}</li>
        ))}
      </ul>
    </div>
  );
}
