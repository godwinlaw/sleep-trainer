"use client";

import { useSearchParams, useRouter } from "next/navigation";
import { useState, useEffect, Suspense } from "react";
import { doc, getDoc } from "firebase/firestore";
import { db } from "@/lib/firebase";
import Header from "@/components/layout/Header";
import NapForm from "@/components/nap/NapForm";
import Button from "@/components/ui/Button";
import Modal from "@/components/ui/Modal";
import { deleteNap } from "@/lib/naps";
import type { NapRecord } from "@/lib/types";

function LogNapContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const editId = searchParams.get("id");
  const [editNap, setEditNap] = useState<NapRecord | null>(null);
  const [loading, setLoading] = useState(!!editId);
  const [showDelete, setShowDelete] = useState(false);
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    if (!editId) return;
    getDoc(doc(db, "naps", editId)).then((snap) => {
      if (snap.exists()) {
        setEditNap({ id: snap.id, ...snap.data() } as NapRecord);
      }
      setLoading(false);
    });
  }, [editId]);

  const handleDelete = async () => {
    if (!editId) return;
    setDeleting(true);
    await deleteNap(editId);
    setShowDelete(false);
    router.push("/");
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <p className="text-sm text-slate-blue-400">Loading...</p>
      </div>
    );
  }

  return (
    <>
      <section className="mx-auto max-w-lg p-4">
        <NapForm editNap={editNap} onSaved={() => router.push("/")} />
        {editNap && (
          <div className="mt-4">
            <Button variant="danger" className="w-full" onClick={() => setShowDelete(true)}>
              Delete Nap
            </Button>
          </div>
        )}
      </section>

      <Modal open={showDelete} onClose={() => setShowDelete(false)} title="Delete Nap">
        <p className="mb-4 text-sm text-slate-blue-600">
          Are you sure you want to delete this nap? This cannot be undone.
        </p>
        <div className="flex gap-3">
          <Button variant="ghost" className="flex-1" onClick={() => setShowDelete(false)}>
            Cancel
          </Button>
          <Button variant="danger" className="flex-1" loading={deleting} onClick={handleDelete}>
            Delete
          </Button>
        </div>
      </Modal>
    </>
  );
}

export default function LogNapPage() {
  return (
    <>
      <Header title="Log Nap" backHref="/" />
      <Suspense fallback={<div className="p-4 text-sm text-slate-blue-400">Loading...</div>}>
        <LogNapContent />
      </Suspense>
    </>
  );
}
