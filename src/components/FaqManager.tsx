"use client";

import { useState } from "react";
import { 
  Search, 
  Plus, 
  Edit3, 
  Trash2,
  X,
  PlusCircle,
  HelpCircle,
  GripVertical,
  Image as ImageIcon,
  Video as VideoIcon,
  Save
} from "lucide-react";
import { saveFaq, deleteFaq } from "@/lib/actions";

interface FaqItem {
  id: string;
  question: string;
  answer: string;
  order: number;
  image_url?: string;
  video_url?: string;
}

export function FaqManager({ initialFaqs }: { initialFaqs: FaqItem[] }) {
  const [faqs, setFaqs] = useState(initialFaqs);
  const [searchQuery, setSearchQuery] = useState("");
  const [editingFaq, setEditingFaq] = useState<FaqItem | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [showModal, setShowModal] = useState(false);

  const filteredFaqs = faqs.filter(faq => 
    faq.question.toLowerCase().includes(searchQuery.toLowerCase()) ||
    faq.answer.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingFaq) return;

    setIsSaving(true);
    try {
      const result = await saveFaq(editingFaq.id === "new" ? null : editingFaq.id, {
        question: editingFaq.question,
        answer: editingFaq.answer,
        order: Number(editingFaq.order),
        image_url: editingFaq.image_url || null,
        video_url: editingFaq.video_url || null,
      });

      if (result.success) {
        setShowModal(false);
        // In a real app, revalidatePath would handle this, but for local state:
        window.location.reload(); 
      } else {
        alert("Error: " + result.error);
      }
    } catch (error) {
      console.error(error);
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this FAQ?")) return;

    try {
      const result = await deleteFaq(id);
      if (result.success) {
        setFaqs(faqs.filter(f => f.id !== id));
      } else {
        alert("Error: " + result.error);
      }
    } catch (error) {
      console.error(error);
    }
  };

  const openModal = (faq?: FaqItem) => {
    if (faq) {
      setEditingFaq(faq);
    } else {
      setEditingFaq({
        id: "new",
        question: "",
        answer: "",
        order: faqs.length,
        image_url: "",
        video_url: ""
      });
    }
    setShowModal(true);
  };

  return (
    <div className="space-y-6">
      <header className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-black text-neutral-900 tracking-tight">Support FAQs</h1>
          <p className="text-neutral-500 font-medium mt-1">Manage the Frequently Asked Questions shown in the Zander app.</p>
        </div>
        <button 
          onClick={() => openModal()}
          className="flex items-center gap-2 px-6 py-3 bg-dark-green text-white font-bold rounded-2xl hover:bg-dark-green/90 transition-all"
        >
          <Plus size={18} />
          <span>Add New FAQ</span>
        </button>
      </header>

      <div className="flex items-center gap-4 mb-6">
        <div className="flex-1 relative group">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-neutral-400 group-focus-within:text-dark-green transition-colors" />
          <input 
            type="text" 
            placeholder="Search FAQs..." 
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-12 pr-4 py-3.5 bg-white border border-neutral-100 rounded-2xl text-sm focus:outline-none focus:ring-4 focus:ring-dark-green/5 focus:border-dark-green/20 transition-all font-medium"
          />
        </div>
      </div>

      <div className="bg-white rounded-[2.5rem] border border-neutral-100 overflow-hidden">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-neutral-50/50">
              <th className="px-8 py-5 text-[10px] font-black uppercase tracking-[0.2em] text-neutral-400 border-b border-neutral-50">Order</th>
              <th className="px-8 py-5 text-[10px] font-black uppercase tracking-[0.2em] text-neutral-400 border-b border-neutral-50">Question & Answer</th>
              <th className="px-8 py-5 text-[10px] font-black uppercase tracking-[0.2em] text-neutral-400 border-b border-neutral-50 text-center">Media</th>
              <th className="px-8 py-5 text-[10px] font-black uppercase tracking-[0.2em] text-neutral-400 border-b border-neutral-50 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-neutral-50">
            {filteredFaqs.map((faq) => (
              <tr key={faq.id} className="hover:bg-neutral-50/30 transition-colors group">
                <td className="px-8 py-6 w-20">
                  <span className="text-sm font-black text-neutral-400 tabular-nums">#{faq.order}</span>
                </td>
                <td className="px-8 py-6">
                  <div className="max-w-2xl">
                    <h4 className="text-[15px] font-bold text-neutral-900 mb-1.5 leading-tight">{faq.question}</h4>
                    <p className="text-sm text-neutral-500 leading-relaxed line-clamp-2">{faq.answer}</p>
                  </div>
                </td>
                <td className="px-8 py-6">
                  <div className="flex items-center justify-center gap-2">
                    {faq.image_url && (
                      <div className="w-8 h-8 rounded-lg bg-mint/10 flex items-center justify-center text-mint" title="Has Image">
                        <ImageIcon size={14} />
                      </div>
                    )}
                    {faq.video_url && (
                      <div className="w-8 h-8 rounded-lg bg-lime/10 flex items-center justify-center text-lime-600" title="Has Video">
                        <VideoIcon size={14} />
                      </div>
                    )}
                    {!faq.image_url && !faq.video_url && (
                      <span className="text-[10px] font-bold text-neutral-300 uppercase tracking-widest">Text Only</span>
                    )}
                  </div>
                </td>
                <td className="px-8 py-6 text-right">
                  <div className="flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button 
                      onClick={() => openModal(faq)}
                      className="p-2.5 bg-neutral-100 text-neutral-500 hover:bg-dark-green hover:text-white rounded-xl transition-all"
                    >
                      <Edit3 size={16} />
                    </button>
                    <button 
                      onClick={() => handleDelete(faq.id)}
                      className="p-2.5 bg-neutral-100 text-neutral-500 hover:bg-red-500 hover:text-white rounded-xl transition-all"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
            {filteredFaqs.length === 0 && (
              <tr>
                <td colSpan={4} className="px-8 py-20 text-center">
                  <div className="max-w-xs mx-auto">
                    <HelpCircle className="w-12 h-12 text-neutral-200 mx-auto mb-4" />
                    <p className="text-neutral-400 font-medium">No FAQs found matching your search.</p>
                  </div>
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {showModal && editingFaq && (
        <div className="fixed inset-0 bg-neutral-900/40 backdrop-blur-sm z-50 flex items-center justify-center p-6">
          <div className="bg-white w-full max-w-xl rounded-[2.5rem] border border-neutral-100 animate-in fade-in zoom-in duration-300 overflow-hidden">
            <form onSubmit={handleSave}>
              <div className="p-8 pb-6 border-b border-neutral-50 flex items-center justify-between bg-white">
                <div>
                  <h3 className="text-xl font-black text-neutral-900 tracking-tight">
                    {editingFaq.id === "new" ? "Add New FAQ" : "Edit FAQ"}
                  </h3>
                  <p className="text-sm text-neutral-400 mt-1 font-medium">Configure support content for mobile users.</p>
                </div>
                <button 
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="w-10 h-10 rounded-full bg-neutral-50 flex items-center justify-center text-neutral-400 hover:bg-neutral-100 hover:text-neutral-900 transition-all"
                >
                  <X size={20} />
                </button>
              </div>

              <div className="p-8 space-y-5 max-h-[60vh] overflow-y-auto custom-scrollbar">
                <div className="grid grid-cols-4 gap-4">
                  <div className="col-span-3 space-y-2">
                    <label className="text-[10px] font-black uppercase tracking-widest text-neutral-400 ml-1">Question</label>
                    <input 
                      type="text" 
                      required
                      value={editingFaq.question}
                      onChange={e => setEditingFaq({...editingFaq, question: e.target.value})}
                      placeholder="e.g. How do I sync my notes?"
                      className="w-full px-5 py-3 bg-neutral-50 border border-neutral-100 rounded-2xl text-sm focus:outline-none focus:ring-4 focus:ring-dark-green/5 focus:border-dark-green/20 transition-all font-medium"
                    />
                  </div>
                    <div className="space-y-2">
                    <label className="text-[10px] font-black uppercase tracking-widest text-neutral-400 ml-1">Order</label>
                    <input 
                      type="number" 
                      required
                      value={isNaN(editingFaq.order) ? "" : editingFaq.order}
                      onChange={e => {
                        const val = parseInt(e.target.value);
                        setEditingFaq({...editingFaq, order: isNaN(val) ? 0 : val});
                      }}
                      className="w-full px-5 py-3 bg-neutral-50 border border-neutral-100 rounded-2xl text-sm focus:outline-none focus:ring-4 focus:ring-dark-green/5 focus:border-dark-green/20 transition-all font-bold tabular-nums"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-[10px] font-black uppercase tracking-widest text-neutral-400 ml-1">Answer</label>
                  <textarea 
                    required
                    rows={4}
                    value={editingFaq.answer}
                    onChange={e => setEditingFaq({...editingFaq, answer: e.target.value})}
                    placeholder="Provide a detailed answer..."
                    className="w-full px-5 py-4 bg-neutral-50 border border-neutral-100 rounded-2xl text-sm focus:outline-none focus:ring-4 focus:ring-dark-green/5 focus:border-dark-green/20 transition-all font-medium resize-none leading-relaxed"
                  />
                </div>

                <div className="space-y-4 pt-2">
                  <div className="space-y-2">
                    <label className="text-[10px] font-black uppercase tracking-widest text-neutral-400 ml-1 flex items-center gap-2">
                      <ImageIcon size={12} className="text-mint" />
                      Image URL (Optional)
                    </label>
                    <input 
                      type="url" 
                      value={editingFaq.image_url || ""}
                      onChange={e => setEditingFaq({...editingFaq, image_url: e.target.value})}
                      placeholder="https://example.com/image.png"
                      className="w-full px-5 py-3 bg-neutral-50 border border-neutral-100 rounded-2xl text-xs focus:outline-none focus:ring-4 focus:ring-dark-green/5 focus:border-dark-green/20 transition-all font-medium"
                    />
                  </div>

                  <div className="space-y-2">
                    <label className="text-[10px] font-black uppercase tracking-widest text-neutral-400 ml-1 flex items-center gap-2">
                      <VideoIcon size={12} className="text-lime-600" />
                      Video URL (Optional)
                    </label>
                    <input 
                      type="url" 
                      value={editingFaq.video_url || ""}
                      onChange={e => setEditingFaq({...editingFaq, video_url: e.target.value})}
                      placeholder="https://youtube.com/watch?v=..."
                      className="w-full px-5 py-3 bg-neutral-50 border border-neutral-100 rounded-2xl text-xs focus:outline-none focus:ring-4 focus:ring-dark-green/5 focus:border-dark-green/20 transition-all font-medium"
                    />
                  </div>
                </div>
              </div>

              <div className="p-8 pt-4 border-t border-neutral-50 bg-white">
                <div className="flex gap-4">
                  <button 
                    type="button"
                    onClick={() => setShowModal(false)}
                    className="flex-1 py-4 bg-white border border-neutral-200 text-neutral-600 font-bold rounded-2xl hover:bg-neutral-50 transition-colors"
                  >
                    Cancel
                  </button>
                  <button 
                    type="submit"
                    disabled={isSaving}
                    className="flex-1 py-4 bg-dark-green text-white font-bold rounded-2xl hover:bg-dark-green/90 disabled:opacity-50 transition-all flex items-center justify-center gap-2"
                  >
                    {isSaving ? (
                      <div className="w-5 h-5 border-2 border-white/20 border-t-white rounded-full animate-spin" />
                    ) : (
                      <>
                        <Save size={18} />
                        <span>Save FAQ</span>
                      </>
                    )}
                  </button>
                </div>
              </div>
            </form>
          </div>
        </div>
      )}

      <style jsx>{`
        .custom-scrollbar::-webkit-scrollbar {
          width: 6px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: transparent;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: #E5E7EB;
          border-radius: 10px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background: #D1D5DB;
        }
      `}</style>
    </div>
  );
}
