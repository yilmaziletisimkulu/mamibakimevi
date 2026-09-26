"use client";

import { deleteCaregiver } from "@/app/actions";

export function DeleteCaregiverButton({ id, name }: { id: string; name: string }) {
  return (
    <form
      action={deleteCaregiver}
      onSubmit={(e) => {
        if (!confirm(`${name} profilini silmek istediğinizden emin misiniz? Bu işlem geri alınamaz.`)) {
          e.preventDefault();
        }
      }}
    >
      <input type="hidden" name="id" value={id} />
      <button
        type="submit"
        className="rounded-full bg-terracotta/10 px-4 py-2 text-sm font-semibold text-terracotta hover:bg-terracotta/20 transition-all"
      >
        🗑 Profili Sil
      </button>
    </form>
  );
}
