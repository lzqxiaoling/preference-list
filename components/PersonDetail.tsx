import React, { useState, useEffect } from 'react';
import { Person, Preference, PreferenceType, Category, GiftSuggestion } from '../types';
import { Icons, CategoryIcon } from './Icons';
import { generateGiftSuggestions, generateProfileSummary } from '../services/geminiService';

interface PersonDetailProps {
  person: Person;
  onUpdatePerson: (updatedPerson: Person) => void;
  onBack: () => void;
  onDeletePerson: (id: string) => void;
}

export const PersonDetail: React.FC<PersonDetailProps> = ({ person, onUpdatePerson, onBack, onDeletePerson }) => {
  const [newPrefItem, setNewPrefItem] = useState('');
  const [newPrefCategory, setNewPrefCategory] = useState<Category>(Category.FOOD);
  const [newPrefType, setNewPrefType] = useState<PreferenceType>(PreferenceType.LIKE);
  
  const [isGeneratingGifts, setIsGeneratingGifts] = useState(false);
  const [giftSuggestions, setGiftSuggestions] = useState<GiftSuggestion[]>([]);
  const [showGiftModal, setShowGiftModal] = useState(false);
  
  const [isSummarizing, setIsSummarizing] = useState(false);

  const handleAddPreference = () => {
    if (!newPrefItem.trim()) return;
    const newPref: Preference = {
      id: Date.now().toString(),
      item: newPrefItem,
      category: newPrefCategory,
      type: newPrefType
    };
    const updatedPerson = {
      ...person,
      preferences: [...person.preferences, newPref],
      lastUpdated: Date.now()
    };
    onUpdatePerson(updatedPerson);
    setNewPrefItem('');
  };

  const handleDeletePreference = (prefId: string) => {
    const updatedPerson = {
      ...person,
      preferences: person.preferences.filter(p => p.id !== prefId),
      lastUpdated: Date.now()
    };
    onUpdatePerson(updatedPerson);
  };

  const handleGenerateSummary = async () => {
    setIsSummarizing(true);
    const summary = await generateProfileSummary(person);
    onUpdatePerson({ ...person, aiSummary: summary });
    setIsSummarizing(false);
  };

  const handleGenerateGifts = async () => {
    setIsGeneratingGifts(true);
    setShowGiftModal(true);
    setGiftSuggestions([]); // Clear previous
    const gifts = await generateGiftSuggestions(person);
    setGiftSuggestions(gifts);
    setIsGeneratingGifts(false);
  };

  const renderPreferenceList = (type: PreferenceType, title: string, colorClass: string, icon: React.ReactNode) => {
    const prefs = person.preferences.filter(p => p.type === type);
    return (
      <div className="mb-8">
        <h3 className={`flex items-center text-lg font-bold mb-3 ${colorClass}`}>
          {icon}
          <span className="ml-2">{title}</span>
          <span className="ml-2 text-xs bg-slate-100 text-slate-500 px-2 py-0.5 rounded-full">{prefs.length}</span>
        </h3>
        {prefs.length === 0 ? (
          <p className="text-slate-400 text-sm italic">暂无记录</p>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {prefs.map(p => (
              <div key={p.id} className="bg-white p-3 rounded-lg border border-slate-100 shadow-sm flex justify-between items-center group hover:border-indigo-100 transition-colors">
                <div className="flex items-center gap-3">
                   <div className={`p-2 rounded-full bg-slate-50 text-slate-500`}>
                      <CategoryIcon category={p.category} className="w-4 h-4" />
                   </div>
                   <div>
                     <p className="font-medium text-slate-800">{p.item}</p>
                     <p className="text-xs text-slate-400">{p.category}</p>
                   </div>
                </div>
                <button 
                  onClick={() => handleDeletePreference(p.id)}
                  className="text-slate-300 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-opacity"
                >
                  <Icons.Trash2 className="w-4 h-4" />
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="animate-fade-in pb-20">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <button onClick={onBack} className="flex items-center text-slate-500 hover:text-indigo-600 transition-colors">
          <Icons.ArrowLeft className="w-5 h-5 mr-1" /> 返回
        </button>
        <div className="flex gap-2">
            <button 
              onClick={() => onDeletePerson(person.id)}
              className="px-3 py-1.5 text-sm text-red-500 hover:bg-red-50 rounded-md border border-transparent hover:border-red-100 transition-colors"
            >
              删除联系人
            </button>
        </div>
      </div>

      {/* Person Header Card */}
      <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-100 mb-6 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-50 rounded-bl-full -mr-8 -mt-8 opacity-50 pointer-events-none"></div>
        <div className="flex flex-col md:flex-row gap-6 items-start md:items-center">
            <img 
              src={person.avatarUrl || `https://picsum.photos/seed/${person.id}/200`} 
              alt={person.name} 
              className="w-20 h-20 rounded-full object-cover border-4 border-indigo-50 shadow-md" 
            />
            <div className="flex-1">
              <h1 className="text-3xl font-bold text-slate-800">{person.name}</h1>
              <span className="inline-block mt-2 px-3 py-1 bg-indigo-100 text-indigo-700 text-sm font-medium rounded-full">
                {person.relationship}
              </span>
            </div>
            <div className="flex gap-3 mt-4 md:mt-0 z-10">
               <button 
                onClick={handleGenerateSummary}
                disabled={isSummarizing}
                className="flex items-center px-4 py-2 bg-white border border-indigo-200 text-indigo-700 rounded-lg hover:bg-indigo-50 transition-colors shadow-sm text-sm"
              >
                 {isSummarizing ? <Icons.Sparkles className="w-4 h-4 mr-2 animate-spin" /> : <Icons.User className="w-4 h-4 mr-2" />}
                 生成画像
               </button>
               <button 
                onClick={handleGenerateGifts}
                className="flex items-center px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors shadow-md shadow-indigo-200 text-sm"
              >
                 <Icons.Gift className="w-4 h-4 mr-2" />
                 AI 礼物顾问
               </button>
            </div>
        </div>

        {/* AI Summary Section */}
        {person.aiSummary && (
          <div className="mt-6 p-4 bg-slate-50 rounded-xl border border-slate-100 text-slate-700 text-sm leading-relaxed">
            <div className="flex items-center gap-2 mb-2 text-indigo-600 font-semibold">
               <Icons.Sparkles className="w-4 h-4" />
               <span>AI 喜好画像</span>
            </div>
            {person.aiSummary}
          </div>
        )}
      </div>

      {/* Add Preference Input */}
      <div className="bg-white rounded-xl p-4 shadow-sm border border-slate-100 mb-8">
        <h3 className="text-sm font-semibold text-slate-500 uppercase tracking-wider mb-4">添加新喜好</h3>
        <div className="flex flex-col md:flex-row gap-3">
          <select 
            value={newPrefType}
            onChange={(e) => setNewPrefType(e.target.value as PreferenceType)}
            className="px-3 py-2 rounded-lg border border-slate-200 bg-slate-50 text-slate-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent text-sm"
          >
            <option value={PreferenceType.LIKE}>❤️ 喜欢</option>
            <option value={PreferenceType.DISLIKE}>👎 讨厌</option>
            <option value={PreferenceType.ALLERGY}>⚠️ 禁忌/过敏</option>
          </select>

          <select 
            value={newPrefCategory}
            onChange={(e) => setNewPrefCategory(e.target.value as Category)}
            className="px-3 py-2 rounded-lg border border-slate-200 bg-slate-50 text-slate-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent text-sm"
          >
             {Object.values(Category).map(c => (
               <option key={c} value={c}>{c}</option>
             ))}
          </select>

          <input 
            type="text" 
            value={newPrefItem}
            onChange={(e) => setNewPrefItem(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleAddPreference()}
            placeholder="例如：草莓蛋糕、棉质衬衫..."
            className="flex-1 px-4 py-2 rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent text-sm"
          />

          <button 
            onClick={handleAddPreference}
            className="px-6 py-2 bg-slate-800 text-white rounded-lg hover:bg-slate-900 transition-colors font-medium text-sm flex items-center justify-center"
          >
            <Icons.Plus className="w-4 h-4 mr-1" /> 添加
          </button>
        </div>
      </div>

      {/* Lists */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
         <div className="lg:col-span-1">
            {renderPreferenceList(PreferenceType.ALLERGY, '禁忌 & 过敏', 'text-red-500', <Icons.AlertTriangle className="w-5 h-5" />)}
         </div>
         <div className="lg:col-span-1">
            {renderPreferenceList(PreferenceType.LIKE, '喜欢', 'text-pink-500', <Icons.Heart className="w-5 h-5" />)}
         </div>
         <div className="lg:col-span-1">
            {renderPreferenceList(PreferenceType.DISLIKE, '讨厌', 'text-slate-500', <Icons.ThumbsDown className="w-5 h-5" />)}
         </div>
      </div>

      {/* Gift Modal */}
      {showGiftModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl w-full max-w-lg shadow-2xl max-h-[80vh] overflow-hidden flex flex-col">
            <div className="p-6 border-b border-slate-100 flex justify-between items-center bg-indigo-50">
              <h3 className="text-xl font-bold text-indigo-900 flex items-center">
                <Icons.Gift className="w-5 h-5 mr-2" />
                为 {person.name} 挑选礼物
              </h3>
              <button onClick={() => setShowGiftModal(false)} className="text-slate-400 hover:text-slate-600">
                ✕
              </button>
            </div>
            
            <div className="p-6 overflow-y-auto">
              {isGeneratingGifts ? (
                <div className="flex flex-col items-center justify-center py-10">
                  <div className="w-10 h-10 border-4 border-indigo-200 border-t-indigo-600 rounded-full animate-spin mb-4"></div>
                  <p className="text-slate-500 animate-pulse">AI 正在根据喜好分析礼物创意...</p>
                </div>
              ) : giftSuggestions.length > 0 ? (
                <div className="space-y-4">
                  {giftSuggestions.map((gift, idx) => (
                    <div key={idx} className="p-4 rounded-xl bg-slate-50 border border-indigo-100 hover:shadow-md transition-all">
                      <div className="flex justify-between items-start mb-1">
                        <h4 className="font-bold text-slate-800">{gift.name}</h4>
                        <span className="text-xs font-mono bg-indigo-100 text-indigo-700 px-2 py-1 rounded">{gift.estimatedPrice}</span>
                      </div>
                      <p className="text-sm text-slate-600">{gift.description}</p>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-10 text-slate-500">
                  未能生成建议，请检查网络或稍后重试。
                </div>
              )}
            </div>
            
            <div className="p-4 border-t border-slate-100 bg-slate-50 text-center">
              <button 
                onClick={handleGenerateGifts}
                className="text-indigo-600 text-sm font-medium hover:underline"
              >
                不满意？重新生成
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};