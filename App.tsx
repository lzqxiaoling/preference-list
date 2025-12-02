import React, { useState, useEffect } from 'react';
import { Person, ViewState, Category, PreferenceType } from './types';
import { PersonDetail } from './components/PersonDetail';
import { StatsChart } from './components/StatsChart';
import { Icons } from './components/Icons';

// --- Mock Data Initialization ---
const INITIAL_PEOPLE: Person[] = [
  {
    id: '1',
    name: '李小龙',
    relationship: '同事',
    lastUpdated: Date.now(),
    preferences: [
      { id: '101', category: Category.FOOD, item: '特辣火锅', type: PreferenceType.LIKE },
      { id: '102', category: Category.DRINK, item: '冰美式 (不加糖)', type: PreferenceType.LIKE },
      { id: '103', category: Category.FOOD, item: '香菜', type: PreferenceType.ALLERGY },
    ]
  },
  {
    id: '2',
    name: 'Sarah Chen',
    relationship: '客户',
    lastUpdated: Date.now(),
    preferences: [
      { id: '201', category: Category.HOBBY, item: '网球', type: PreferenceType.LIKE },
      { id: '202', category: Category.GIFT, item: '红酒', type: PreferenceType.LIKE },
      { id: '203', category: Category.FOOD, item: '海鲜', type: PreferenceType.DISLIKE },
    ]
  }
];

const App: React.FC = () => {
  const [people, setPeople] = useState<Person[]>(() => {
    const saved = localStorage.getItem('prefkeep_data');
    return saved ? JSON.parse(saved) : INITIAL_PEOPLE;
  });

  const [view, setView] = useState<ViewState>('DASHBOARD');
  const [selectedPersonId, setSelectedPersonId] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  
  // New Person Form State
  const [newPersonName, setNewPersonName] = useState('');
  const [newPersonRel, setNewPersonRel] = useState('朋友');

  useEffect(() => {
    localStorage.setItem('prefkeep_data', JSON.stringify(people));
  }, [people]);

  const handlePersonClick = (id: string) => {
    setSelectedPersonId(id);
    setView('PERSON_DETAIL');
  };

  const handleAddPerson = () => {
    if (!newPersonName.trim()) return;
    const newPerson: Person = {
      id: Date.now().toString(),
      name: newPersonName,
      relationship: newPersonRel,
      preferences: [],
      lastUpdated: Date.now()
    };
    setPeople([newPerson, ...people]);
    setNewPersonName('');
    setView('PERSON_DETAIL');
    setSelectedPersonId(newPerson.id);
  };

  const handleUpdatePerson = (updated: Person) => {
    setPeople(people.map(p => p.id === updated.id ? updated : p));
  };

  const handleDeletePerson = (id: string) => {
    if (confirm('确定要删除这位联系人吗？')) {
      setPeople(people.filter(p => p.id !== id));
      setView('DASHBOARD');
      setSelectedPersonId(null);
    }
  };

  const filteredPeople = people.filter(p => 
    p.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
    p.relationship.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const getRecentUpdates = () => {
    return [...people].sort((a, b) => b.lastUpdated - a.lastUpdated).slice(0, 3);
  };

  const renderSidebar = () => (
    <div className="w-full md:w-64 bg-white border-r border-slate-200 flex-shrink-0 flex flex-col h-screen sticky top-0">
      <div className="p-6 border-b border-slate-100">
        <h1 className="text-2xl font-extrabold text-indigo-600 flex items-center gap-2">
          <Icons.Heart className="fill-current" />
          喜好纪
        </h1>
        <p className="text-xs text-slate-400 mt-1">用心记住每一次在意</p>
      </div>

      <nav className="flex-1 p-4 space-y-2 overflow-y-auto">
        <button 
          onClick={() => setView('DASHBOARD')}
          className={`w-full flex items-center px-4 py-3 rounded-xl transition-all ${view === 'DASHBOARD' ? 'bg-indigo-50 text-indigo-700 font-medium' : 'text-slate-600 hover:bg-slate-50'}`}
        >
          <Icons.LayoutGrid className="w-5 h-5 mr-3" />
          概览
        </button>
        <button 
          onClick={() => setView('PERSON_LIST')}
          className={`w-full flex items-center px-4 py-3 rounded-xl transition-all ${view === 'PERSON_LIST' ? 'bg-indigo-50 text-indigo-700 font-medium' : 'text-slate-600 hover:bg-slate-50'}`}
        >
          <Icons.Users className="w-5 h-5 mr-3" />
          联系人列表
        </button>
      </nav>

      <div className="p-4 border-t border-slate-100">
        <button 
          onClick={() => setView('ADD_PERSON')}
          className="w-full bg-slate-800 hover:bg-slate-900 text-white py-3 rounded-xl flex items-center justify-center transition-colors shadow-lg shadow-slate-200"
        >
          <Icons.Plus className="w-5 h-5 mr-2" />
          添加新人
        </button>
      </div>
    </div>
  );

  const renderDashboard = () => (
    <div className="animate-fade-in space-y-6">
      <header className="mb-8">
        <h2 className="text-3xl font-bold text-slate-800">下午好 👋</h2>
        <p className="text-slate-500 mt-1">您目前记录了 {people.length} 位亲友的喜好。</p>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
           {/* Stats */}
           <StatsChart people={people} />
           
           {/* Recent Updates */}
           <div>
              <h3 className="text-lg font-semibold text-slate-800 mb-4 flex items-center">
                <Icons.Edit2 className="w-4 h-4 mr-2" /> 最近更新
              </h3>
              <div className="grid gap-4">
                {getRecentUpdates().map(person => (
                  <div 
                    key={person.id} 
                    onClick={() => handlePersonClick(person.id)}
                    className="bg-white p-4 rounded-xl border border-slate-100 shadow-sm hover:shadow-md transition-shadow cursor-pointer flex items-center gap-4"
                  >
                    <img src={person.avatarUrl || `https://picsum.photos/seed/${person.id}/100`} alt="" className="w-12 h-12 rounded-full bg-slate-100" />
                    <div>
                      <h4 className="font-bold text-slate-800">{person.name}</h4>
                      <p className="text-xs text-slate-500">
                        {person.preferences.length} 条喜好 · {new Date(person.lastUpdated).toLocaleDateString()}
                      </p>
                    </div>
                    <div className="ml-auto">
                      <Icons.ArrowLeft className="w-5 h-5 text-slate-300 rotate-180" />
                    </div>
                  </div>
                ))}
              </div>
           </div>
        </div>

        <div className="bg-gradient-to-br from-indigo-500 to-purple-600 rounded-2xl p-6 text-white shadow-xl">
           <h3 className="text-xl font-bold mb-2">💡 礼物灵感</h3>
           <p className="text-indigo-100 text-sm mb-6">不知道送什么？进入联系人详情页，让 AI 助手基于他们的喜好为您推荐完美礼物。</p>
           <div className="bg-white/10 rounded-lg p-4 backdrop-blur-sm">
             <div className="flex items-center gap-3 mb-2">
               <div className="w-8 h-8 rounded-full bg-white/20 flex items-center justify-center">
                 <Icons.Gift className="w-4 h-4" />
               </div>
               <span className="font-medium text-sm">AI 智能分析</span>
             </div>
             <p className="text-xs text-indigo-100">我们会分析饮食、爱好和禁忌，生成个性化推荐。</p>
           </div>
        </div>
      </div>
    </div>
  );

  const renderPersonList = () => (
    <div className="animate-fade-in">
      <div className="flex flex-col md:flex-row justify-between items-center mb-6 gap-4">
        <h2 className="text-2xl font-bold text-slate-800">联系人</h2>
        <div className="relative w-full md:w-auto">
          <Icons.Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input 
            type="text" 
            placeholder="搜索名字或关系..." 
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full md:w-64 pl-10 pr-4 py-2 rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500"
          />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredPeople.map(person => (
          <div 
            key={person.id}
            onClick={() => handlePersonClick(person.id)}
            className="bg-white p-5 rounded-2xl border border-slate-100 shadow-sm hover:border-indigo-200 hover:shadow-md transition-all cursor-pointer group"
          >
             <div className="flex items-start justify-between mb-4">
               <img src={person.avatarUrl || `https://picsum.photos/seed/${person.id}/100`} className="w-14 h-14 rounded-full border-2 border-white shadow-sm" alt="" />
               <span className="px-2 py-1 bg-slate-50 text-slate-500 text-xs rounded-md font-medium">{person.relationship}</span>
             </div>
             <h3 className="text-lg font-bold text-slate-800 mb-1 group-hover:text-indigo-600 transition-colors">{person.name}</h3>
             <div className="flex gap-2 mt-3">
               <span className="flex items-center text-xs text-pink-500 bg-pink-50 px-2 py-1 rounded-full">
                 <Icons.Heart className="w-3 h-3 mr-1" />
                 {person.preferences.filter(p => p.type === PreferenceType.LIKE).length}
               </span>
               <span className="flex items-center text-xs text-red-500 bg-red-50 px-2 py-1 rounded-full">
                 <Icons.AlertTriangle className="w-3 h-3 mr-1" />
                 {person.preferences.filter(p => p.type === PreferenceType.ALLERGY).length}
               </span>
             </div>
          </div>
        ))}
        
        <button 
          onClick={() => setView('ADD_PERSON')}
          className="flex flex-col items-center justify-center p-5 rounded-2xl border-2 border-dashed border-slate-200 text-slate-400 hover:border-indigo-400 hover:text-indigo-500 transition-all min-h-[180px]"
        >
          <div className="w-12 h-12 rounded-full bg-slate-50 flex items-center justify-center mb-2">
            <Icons.Plus className="w-6 h-6" />
          </div>
          <span className="font-medium">添加新联系人</span>
        </button>
      </div>
    </div>
  );

  const renderAddPerson = () => (
    <div className="max-w-md mx-auto animate-fade-in mt-10">
      <button onClick={() => setView('DASHBOARD')} className="flex items-center text-slate-500 hover:text-indigo-600 mb-6">
        <Icons.ArrowLeft className="w-4 h-4 mr-1" /> 取消
      </button>
      <div className="bg-white p-8 rounded-2xl shadow-xl border border-slate-100">
        <div className="text-center mb-8">
           <div className="w-16 h-16 bg-indigo-100 text-indigo-600 rounded-full flex items-center justify-center mx-auto mb-4">
             <Icons.User className="w-8 h-8" />
           </div>
           <h2 className="text-2xl font-bold text-slate-800">新建档案</h2>
           <p className="text-slate-500 text-sm mt-1">开始记录关于 TA 的一切</p>
        </div>
        
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">姓名</label>
            <input 
              type="text" 
              value={newPersonName}
              onChange={(e) => setNewPersonName(e.target.value)}
              className="w-full px-4 py-2 rounded-lg border border-slate-300 focus:ring-2 focus:ring-indigo-500 focus:outline-none"
              placeholder="例如：王小明"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">关系</label>
            <select 
              value={newPersonRel}
              onChange={(e) => setNewPersonRel(e.target.value)}
              className="w-full px-4 py-2 rounded-lg border border-slate-300 focus:ring-2 focus:ring-indigo-500 focus:outline-none bg-white"
            >
              <option>朋友</option>
              <option>家人</option>
              <option>同事</option>
              <option>客户</option>
              <option>伴侣</option>
              <option>其他</option>
            </select>
          </div>
          <button 
            onClick={handleAddPerson}
            disabled={!newPersonName}
            className="w-full py-3 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-xl transition-colors disabled:opacity-50 disabled:cursor-not-allowed mt-4"
          >
            创建档案
          </button>
        </div>
      </div>
    </div>
  );

  return (
    <div className="flex flex-col md:flex-row min-h-screen bg-slate-50 text-slate-900 font-sans">
      {renderSidebar()}
      
      <main className="flex-1 overflow-y-auto h-screen p-4 md:p-8 lg:p-12">
        <div className="max-w-5xl mx-auto">
          {view === 'DASHBOARD' && renderDashboard()}
          {view === 'PERSON_LIST' && renderPersonList()}
          {view === 'ADD_PERSON' && renderAddPerson()}
          {view === 'PERSON_DETAIL' && selectedPersonId && (
            <PersonDetail 
              person={people.find(p => p.id === selectedPersonId)!}
              onUpdatePerson={handleUpdatePerson}
              onBack={() => setView('DASHBOARD')}
              onDeletePerson={handleDeletePerson}
            />
          )}
        </div>
      </main>
    </div>
  );
};

export default App;