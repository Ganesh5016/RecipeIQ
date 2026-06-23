import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { HeartPulse, Activity, Plus, Save } from 'lucide-react';
import { useForm } from 'react-hook-form';
import { healthAPI } from '../../services/api.js';
import toast from 'react-hot-toast';

export default function HealthAdvisorPage() {
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [analyzing, setAnalyzing] = useState(false);
  const [tracking, setTracking] = useState(false);

  const { register, handleSubmit, reset } = useForm();
  const { register: registerTrack, handleSubmit: handleTrack, reset: resetTrack } = useForm();

  const [conditions, setConditions] = useState([]);
  const [condInput, setCondInput] = useState('');

  const [allergies, setAllergies] = useState([]);
  const [allergyInput, setAllergyInput] = useState('');

  useEffect(() => {
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    try {
      const { profile: data } = await healthAPI.getProfile();
      setProfile(data);
      if (data) {
        reset({ age: data.age, gender: data.gender, height: data.height, weight: data.weight });
        setConditions(data.conditions || []);
        setAllergies(data.allergies || []);
      }
    } catch (err) {
      toast.error('Failed to load profile');
    } finally {
      setLoading(false);
    }
  };

  const addTag = (val, setter, list) => {
    if (val.trim() && !list.includes(val.trim())) setter([...list, val.trim()]);
  };
  const removeTag = (val, setter, list) => setter(list.filter(x => x !== val));

  const onAnalyze = async (data) => {
    setAnalyzing(true);
    try {
      const payload = { ...data, conditions, allergies };
      const { profile: newProfile } = await healthAPI.analyze(payload);
      setProfile(newProfile);
      toast.success('AI Diet Plan generated!');
    } catch (err) {
      toast.error(err.message);
    } finally {
      setAnalyzing(false);
    }
  };

  const onTrack = async (data) => {
    setTracking(true);
    try {
      const { profile: newProfile } = await healthAPI.track(data);
      setProfile(newProfile);
      resetTrack();
      toast.success('Record added!');
    } catch (err) {
      toast.error(err.message);
    } finally {
      setTracking(false);
    }
  };

  if (loading) return <div className="text-center py-20">Loading...</div>;

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-black text-gray-900 dark:text-white flex items-center gap-2">
          <HeartPulse className="w-6 h-6 text-red-500" /> Health & Diet Advisor
        </h1>
        <p className="text-gray-500 dark:text-gray-400 text-sm mt-1">Get personalized diet plans and track your health</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="space-y-6">
          <div className="card p-6">
            <h2 className="font-bold mb-4">Your Health Profile</h2>
            <form onSubmit={handleSubmit(onAnalyze)} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div><label className="block text-sm mb-1">Age</label><input type="number" {...register('age')} className="input-field py-2" /></div>
                <div><label className="block text-sm mb-1">Gender</label><select {...register('gender')} className="input-field py-2"><option value="">Select</option><option value="male">Male</option><option value="female">Female</option></select></div>
                <div><label className="block text-sm mb-1">Height (cm)</label><input type="number" {...register('height')} className="input-field py-2" /></div>
                <div><label className="block text-sm mb-1">Weight (kg)</label><input type="number" {...register('weight')} className="input-field py-2" /></div>
              </div>

              <div>
                <label className="block text-sm mb-1">Health Conditions</label>
                <div className="flex gap-2 mb-2">
                  <input value={condInput} onChange={e => setCondInput(e.target.value)} onKeyDown={e => e.key === 'Enter' && (e.preventDefault(), addTag(condInput, setConditions, conditions), setCondInput(''))} className="input-field flex-1 py-2" placeholder="e.g., Diabetes" />
                  <button type="button" onClick={() => { addTag(condInput, setConditions, conditions); setCondInput(''); }} className="btn-secondary py-2 px-3"><Plus className="w-4 h-4" /></button>
                </div>
                <div className="flex flex-wrap gap-2">{conditions.map(c => <span key={c} className="tag bg-red-100 text-red-700">{c} <button onClick={() => removeTag(c, setConditions, conditions)}>&times;</button></span>)}</div>
              </div>

              <div>
                <label className="block text-sm mb-1">Allergies</label>
                <div className="flex gap-2 mb-2">
                  <input value={allergyInput} onChange={e => setAllergyInput(e.target.value)} onKeyDown={e => e.key === 'Enter' && (e.preventDefault(), addTag(allergyInput, setAllergies, allergies), setAllergyInput(''))} className="input-field flex-1 py-2" placeholder="e.g., Peanuts" />
                  <button type="button" onClick={() => { addTag(allergyInput, setAllergies, allergies); setAllergyInput(''); }} className="btn-secondary py-2 px-3"><Plus className="w-4 h-4" /></button>
                </div>
                <div className="flex flex-wrap gap-2">{allergies.map(a => <span key={a} className="tag bg-orange-100 text-orange-700">{a} <button onClick={() => removeTag(a, setAllergies, allergies)}>&times;</button></span>)}</div>
              </div>

              <button type="submit" disabled={analyzing} className="btn-primary w-full py-2 flex items-center justify-center gap-2">
                <Activity className="w-4 h-4" /> {analyzing ? 'Analyzing...' : 'Generate AI Diet Plan'}
              </button>
            </form>
          </div>

          <div className="card p-6">
            <h2 className="font-bold mb-4">Track Daily Progress</h2>
            <form onSubmit={handleTrack(onTrack)} className="flex gap-2 items-end">
              <div className="flex-1"><label className="block text-xs mb-1">Weight (kg)</label><input type="number" step="0.1" {...registerTrack('weight')} className="input-field py-2" /></div>
              <div className="flex-1"><label className="block text-xs mb-1">Calories Consumed</label><input type="number" {...registerTrack('caloriesConsumed')} className="input-field py-2" /></div>
              <button disabled={tracking} className="btn-secondary py-2 h-[42px]"><Save className="w-4 h-4" /></button>
            </form>
            
            <div className="mt-4 max-h-40 overflow-y-auto space-y-2">
              {profile?.records?.slice().reverse().map((r, i) => (
                <div key={i} className="flex justify-between text-sm p-2 bg-gray-50 dark:bg-gray-800 rounded">
                  <span>{new Date(r.date).toLocaleDateString()}</span>
                  <span className="font-bold">{r.weight} kg</span>
                  <span className="text-orange-500">{r.caloriesConsumed} kcal</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="card p-6 h-full min-h-[500px]">
          <h2 className="font-bold mb-4 text-xl">AI Diet Plan</h2>
          {!profile?.aiDietPlan ? (
             <div className="text-center py-20 text-gray-500">Submit your profile to get a personalized diet plan.</div>
          ) : (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6">
               <div className="p-4 bg-primary-50 dark:bg-primary-900/20 rounded-xl text-center">
                 <p className="text-sm text-primary-600 mb-1">Recommended Daily Calories</p>
                 <p className="text-3xl font-black text-primary-700">{profile.aiDietPlan.recommendedCalories} <span className="text-lg">kcal</span></p>
               </div>
               
               <div>
                 <h3 className="font-semibold text-green-600 mb-2 flex items-center gap-2">✅ Foods to Eat</h3>
                 <ul className="list-disc pl-5 space-y-1 text-sm text-gray-700 dark:text-gray-300">
                   {profile.aiDietPlan.foodsToEat?.map((f, i) => <li key={i}>{f}</li>)}
                 </ul>
               </div>

               <div>
                 <h3 className="font-semibold text-red-600 mb-2 flex items-center gap-2">❌ Foods to Avoid</h3>
                 <ul className="list-disc pl-5 space-y-1 text-sm text-gray-700 dark:text-gray-300">
                   {profile.aiDietPlan.foodsToAvoid?.map((f, i) => <li key={i}>{f}</li>)}
                 </ul>
               </div>

               <div className="p-4 border border-gray-200 dark:border-gray-700 rounded-xl">
                 <h3 className="font-semibold mb-2 text-sm">General Advice</h3>
                 <p className="text-sm text-gray-600 dark:text-gray-400">{profile.aiDietPlan.generalAdvice}</p>
               </div>
            </motion.div>
          )}
        </div>
      </div>
    </div>
  );
}
