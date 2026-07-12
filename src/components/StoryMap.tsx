/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { motion } from 'motion/react';
import { GameState, GameStats, Skin } from '../types';
import { AudioEngine } from '../audio';
import { 
  ArrowLeft, BookOpen, Compass, Lock, CheckCircle2, 
  Sparkles, Flame, Play, Eye, Trophy, Shield, HelpCircle 
} from 'lucide-react';

interface StoryMapProps {
  stats: GameStats;
  skins: Skin[];
  onStateChange: (state: GameState) => void;
  onLaunchChapter: (level: number) => void;
  onPlayEnding: () => void;
}

export interface StoryChapter {
  id: number;
  name: string;
  nameTamil: string;
  landKey: string;
  guardian: string;
  guardianTamil: string;
  description: string;
  descriptionTamil: string;
  poeticPrompt: string[];
  poeticPromptTamil: string[];
  unlockSkinId: string;
  unlockSkinName: string;
  unlockedSkinTamil: string;
  rewardFeathers: number;
  coordinates: { x: number; y: number };
}

export const STORY_CHAPTERS: StoryChapter[] = [
  {
    id: 1,
    name: 'Kurinji (குறிஞ்சி)',
    nameTamil: 'மலைகளின் விழிப்பு',
    landKey: 'KURINJI',
    guardian: 'Corrupted Yali Stone Guardian',
    guardianTamil: 'சீற்றமடைந்த யாழி காவல் தெய்வம்',
    description: 'Agni Paravai awakens in the high mountain peaks of Kurinji. The sacred monolithic Yali guardian has been corrupted by shadow energy, turning the mountain shrines to silent stone.',
    descriptionTamil: 'குறிஞ்சியின் பனிமூட்ட மலைகளில் அக்னி பறவை விழித்தெழுகிறது. பழங்கால யாழி காவல் தெய்வம் இருள் சக்திகளால் பீடிக்கப்பட்டு, கற் சிலையாக உறைந்துள்ளது.',
    poeticPrompt: [
      'The ancient peaks tremble...',
      'The sacred monolithic Yali guardian has awakened in shadow.',
      'Soar high, Agni Paravai, and cleanse the stone protector!'
    ],
    poeticPromptTamil: [
      'பண்டைய மலைகள் நடுங்குகின்றன...',
      'புனித யாழி காவல் தெய்வம் இருளில் விழித்துக் கொண்டது.',
      'உயரப் பற அக்னி பறவையே, கல் காவலைத் தூய்மைப்படுத்து!'
    ],
    unlockSkinId: 'sparrow',
    unlockSkinName: 'Kuruvi (Nimble Sparrow)',
    unlockedSkinTamil: 'குருவி ( nimble sparrow )',
    rewardFeathers: 100,
    coordinates: { x: 15, y: 55 }
  },
  {
    id: 2,
    name: 'Mullai (முல்லை)',
    nameTamil: 'காடுகளின் குழப்பம்',
    landKey: 'MULLAI',
    guardian: 'Forest Illusion Spirit',
    guardianTamil: 'முல்லை வன மாயை ஆவி',
    description: 'The ancient canopy woods of Mullai are filled with eerie shadows and illusions. The mystical cuckoo (Koel) is trapped in a dream-like maze.',
    descriptionTamil: 'முல்லை வனத்தின் பசுமையான மரக்கிளைகள் இருள் நிழல்களால் சூழப்பட்டுள்ளன. குயில் பறவை மாயை வலையில் சிக்கியுள்ளது. காட்டின் அமைதியை மீட்பாயாக!',
    poeticPrompt: [
      'The silent woods whisper in despair...',
      'Eerie illusions fill the green branches.',
      'Bring back the sweet notes of harmony!'
    ],
    poeticPromptTamil: [
      'அமைதியான காடுகள் துயரத்துடன் கிசுகிசுக்கின்றன...',
      'பசுமைக் கிளைகளில் அச்சமூட்டும் மாயைகள் சூழு்கின்றன.',
      'இசை இணக்கத்தின் இனிமையான குரலை மீட்டு வா!'
    ],
    unlockSkinId: 'peacock',
    unlockSkinName: 'Mayil (Celestial Peacock)',
    unlockedSkinTamil: 'மயில் ( celestial peacock )',
    rewardFeathers: 150,
    coordinates: { x: 35, y: 30 }
  },
  {
    id: 3,
    name: 'Marutham (மருதம்)',
    nameTamil: 'வயல்களின் போராட்டம்',
    landKey: 'MARUTHAM',
    guardian: 'Corrupted Raging Bull',
    guardianTamil: 'சீற்றம் கொண்ட பொன் காளை',
    description: 'The fertile farm fields of Marutham run dry as the sacred golden Bull, representing the balance of humans and nature, charges in blinding fury.',
    descriptionTamil: 'மருத நிலத்தின் செழிப்பான வயல்வெளிகள் வறண்டு போகின்றன. மனிதனுக்கும் இயற்கைக்கும் உள்ள சமநிலையை உணர்த்தும் பொன் காளை பெருங் கோபத்துடன் சுழல்கிறது.',
    poeticPrompt: [
      'The golden grains wither under shadow...',
      'The sacred Bull charges with blinding fury.',
      'Restore the eternal bond of earth and life!'
    ],
    poeticPromptTamil: [
      'பொற்கதிர் வயல்கள் நிழல்களால் கருகுகின்றன...',
      'புனிதக் காளை கண்மூடித்தனமான சீற்றத்துடன் பாய்கிறது.',
      'மண்ணுக்கும் மனிதனுக்கும் உள்ள நித்திய பந்தத்தை மீட்டெடு!'
    ],
    unlockSkinId: 'garuda',
    unlockSkinName: 'Pon Garudan (Divine Eagle)',
    unlockedSkinTamil: 'பொன் கருடன் ( divine eagle )',
    rewardFeathers: 200,
    coordinates: { x: 55, y: 65 }
  },
  {
    id: 4,
    name: 'Neithal (நெய்தல்)',
    nameTamil: 'கடற்கரையின் பெருஞ்சீற்றம்',
    landKey: 'NEITHAL',
    guardian: 'Abyssal Sea Serpent',
    guardianTamil: 'ஆழ்கடல் நாக அரசன்',
    description: 'Tempestuous storms batter the seashores of Neithal. The primordial Abyssal Sea Serpent has risen, turning the ocean waves into boiling dark currents.',
    descriptionTamil: 'நெய்தல் கடற்கரையில் பெருஞ்சூறாவளி வீசுகிறது. ஆழ்கடல் நாக அரசன் கடல் அலையை கொதிக்கும் இருள் நீரோட்டமாக மாற்றி எழுந்துள்ளான்.',
    poeticPrompt: [
      'The ocean boils, storms split the heavens...',
      'The ancient Sea Serpent rises from the black abyss.',
      'Ride the high winds, phoenix, and calm the waves!'
    ],
    poeticPromptTamil: [
      'கடல் கொதிக்கிறது, புயல் விண்ணைப் பிளக்கிறது...',
      'இருண்ட படுகுழியில் இருந்து கடல் நாக அரசன் எழுகிறான்.',
      'பெருங்காற்றில் பறந்து அலைகளை அமைதிப்படுத்துவாய்!'
    ],
    unlockSkinId: 'yali',
    unlockSkinName: 'Yali Spirit Bird',
    unlockedSkinTamil: 'யாழி காப்புப் பறவை ( protective yali )',
    rewardFeathers: 250,
    coordinates: { x: 75, y: 35 }
  },
  {
    id: 5,
    name: 'Palai (பாலை)',
    nameTamil: 'மண்ணின் வெம்பாலை',
    landKey: 'PAALAI',
    guardian: 'Eternal Sand Demon',
    guardianTamil: 'முடிவிலா வெண்மணல் அரக்கன்',
    description: 'The final desolate desert of Palai represents ultimate destruction. The Sun-scorched Sand Demon guards the ancient temple core, keeping all lands in a cursed limbo.',
    descriptionTamil: 'பாலைவனத்தின் வறண்ட மணல் பரப்பில் இறுதிப் போர் காத்துள்ளது. வெண்மணல் அரக்கன் பண்டைய கோவில் கருவறையைக் காத்து, ஒட்டுமொத்த உலகையும் இருளில் நிறுத்திவைத்துள்ளான்.',
    poeticPrompt: [
      'The world is turning to ashes and dust...',
      'The Sun-scorched Sand Demon bars the temple gate.',
      'Burn with the ultimate fire, restore the cosmic core!'
    ],
    poeticPromptTamil: [
      'உலகம் சாம்பலாகவும் தூசியாகவும் மாறுகிறது...',
      'சூரிய வெப்ப அரக்கன் கோவில் வாசலை மறிக்கிறான்.',
      'இறுதி நெருப்புடன் எரிந்து, பிரபஞ்ச மையத்தை மீட்டெடு!'
    ],
    unlockSkinId: 'rudra',
    unlockSkinName: 'Rudra Phoenix (Cosmic Avatar)',
    unlockedSkinTamil: 'ருத்ர பறவை ( ultimate cosmic skin )',
    rewardFeathers: 500,
    coordinates: { x: 90, y: 60 }
  }
];

export const StoryMap: React.FC<StoryMapProps> = ({
  stats,
  skins,
  onStateChange,
  onLaunchChapter,
  onPlayEnding
}) => {
  const currentCheckpoint = stats.storyCheckpoint || 1; // Default to level 1
  const [selectedChapterId, setSelectedChapterId] = useState<number>(
    Math.min(5, currentCheckpoint)
  );
  const [showStoryTeller, setShowStoryTeller] = useState<boolean>(false);

  const selectedChapter = STORY_CHAPTERS.find(c => c.id === selectedChapterId) || STORY_CHAPTERS[0];

  const handleBack = () => {
    AudioEngine.playButton();
    onStateChange(GameState.MENU);
  };

  const handleChapterClick = (id: number) => {
    if (id > currentCheckpoint) {
      AudioEngine.playCrash(); // Locked cue
      return;
    }
    setSelectedChapterId(id);
    AudioEngine.playButton();
  };

  const handleLaunch = () => {
    AudioEngine.playScore(); // Sacred bell chime
    setShowStoryTeller(true);
  };

  const isStoryCompleted = currentCheckpoint > 5;

  const getChapterLore = (id: number) => {
    switch (id) {
      case 1:
        return {
          lore: "From the misty, cloud-kissed peaks of Kurinji's towering mountains, a deep cold silence grips the sacred sanctuaries. The colossal monolithic stone beast, the Yali, who once guarded pilgrims with celestial devotion, has been blinded by creeping dark shadows. His granite eyes now burn with corrupted crimson fire. Agni Paravai, the divine fire phoenix, flares its cosmic wings! You must soar through the razor-sharp mountain spires, dodge the crushing pillars of stone, outrun the ancient collapsing temple ruins, and pierce the Yali's dark heart to ignite the flame of hope on the holy mountain peak!",
          tamil: "குறிஞ்சியின் பனிமூட்ட மலைகளில் பழங்கால யாழி காவல் தெய்வம் இருள் சக்திகளால் கற் சிலையாக உறைந்துள்ளது. அக்னி பறவையே, உனது வானuலக அக்னிச் சிறகுகளை விரித்து எழுவாயாக! கூர்மையான மலைச்சிகரங்களையும், விழும் பாறைகளையும் கடந்து பறந்து, யாழியின் இருண்ட இதயத்தைத் தூய்மைப்படுத்தி, புனித மலையில் மீண்டும் ஒளியைக் கொண்டு வா!",
          tagline: "ACT I: THE AWAKENING OF KURINJI • குறிஞ்சி விழிப்பு"
        };
      case 2:
        return {
          lore: "Deep within the emerald-canopied woods of Mullai, the birds have forgotten their songs. The ancient trees have grown twisted, casting long, creeping shadow illusions that block out the heavens. The holy forest protector, a colossal serpent of thorns and deception, has spun a dizzying dream-like maze of poisonous thorns. To save the wilderness, Agni Paravai must dive through the dense canopy, dodge the thorny obstacles, and unleash celestial flames to burn away the shadow vines, restoring harmony to the forest!",
          tamil: "முல்லை வனத்தின் பசுமையான மரங்கள் இருள் நிழல்களால் சூழப்பட்டு நச்சு முட்களாக மாறியுள்ளன. காட்டின் காவல் ஆவி பெரும் குழப்பத்தில் ஆழ்த்தப்பட்டுள்ளது. அக்னிப் பறவையே! அடர்ந்த காடுகளின் வழியே பாய்ந்து, உனது புனித ஒளியால் நச்சுப் படர் கொடிகளை எரித்து, முல்லை நிலத்திற்கு அமைதியைத் தருவாயாக!",
          tagline: "ACT II: THE MULLAI ILLUSION • முல்லை வன மாயை"
        };
      case 3:
        return {
          lore: "The fertile, golden fields of Marutham run dry under a boiling blood-red sky. A blinding scarlet storm of pure rage has infected the earth, corrupting the sacred golden Bull—the eternal celestial symbol of humanity's bond with nature. Now rampaging in blind fury, its molten bronze horns shatter the ancient aqueducts and lay waste to the shrines. You must descend upon the plains, outmaneuver the raging bull's charging stampedes, and soothe its furious spirit with celestial fire!",
          tamil: "மருத நிலத்தின் செழிப்பான வயல்வெளிகள் வறண்டு கருகுகின்றன. மனிதனுக்கும் இயற்கைக்கும் உள்ள புனித சமநிலையான பொன் காளை பெருங் கோபத்துடன் சுழன்று வயல்களை அழிக்கிறது. அக்னிப் பறவையே! மருத நிலத்து வயல்களுக்குள் பாய்ந்து, பொன் காளையின் சீற்றத்தைத் தணித்து, பூமியின் சமநிலையை மீட்பாயாக!",
          tagline: "ACT III: RAGE OF MARUTHAM • மருதத்தின் சீற்றம்"
        };
      case 4:
        return {
          lore: "A tremendous, celestial tempest splits the ocean heavens of Neithal. Deep under the boiling tides, the primordial Abyssal Sea Serpent has risen in blinding fury, transforming the ocean currents into black, scalding waves. Ancient mutated carnivorous swamp plants and razor-sharp coral reefs snap from the deep! The sacred gopurams along the seashore are half-sunken. Ride the high winds, phoenix! Avoid the toxic snapping fangs and calm the boiling waves to banish the ocean beast back into the deep!",
          tamil: "நெய்தல் கடற்கரையில் பெருஞ்சூறாவளி விண்ணைப் பிளக்கிறது. ஆழ்கடல் நாக அரசன் அலையைக் கொதிக்கும் இருள் நீரோட்டமாக மாற்றி எழுந்துள்ளான். அக்னிப் பறவையே! பெருங்காற்றிலும் அலைகளிலும் துணிவுடன் பறந்து, ஆழ்கடல் நாகனின் கொதிப்பிலிருந்து நெய்தல் கோபுரங்களைக் காப்பாயாக!",
          tagline: "ACT IV: THE NEITHAL TEMPEST • நெய்தல் கடல் நாகம்"
        };
      case 5:
      default:
        return {
          lore: "All of creation fades to ash and dry dust on the scorched, desolate deserts of Palai. This is the final, ultimate boundary of shadows. The colossal Sun-Scorched Sand Demon, armed with a furnace of infinite heat, bars the entrance to the inner sanctum. Hyper-fast pillars of volcanic stone and rotating solar lasers fill the suffocating air. Only the ultimate, pure Agni fire can penetrate the demon's solid obsidian armor. Let your wings carry the cosmic fire, Agni Paravai, reclaim the final gopuram, and restore the eternal golden light to all five lands!",
          tamil: "பாலைவனத்தின் வறண்ட மணல் பரப்பில் இறுதிப் போர் காத்துள்ளது. வெண்மணல் அரக்கன் கோவில் கருவறையை மறித்து நிற்கிறான். அக்னிப் பறவையே, உனது இறுதி நெருப்புடன் எரிந்து, அவனது விண்மீன் கதிர்களைக் கடந்து, கருவறையை மீட்டு, ஐந்து திணைகளுக்கும் நித்திய பொன் ஒளியை வழங்குவாயாக!",
          tagline: "ACT V: THE ECLIPSE OF PALAI • பாலைவன இறுதிப் போர்"
        };
    }
  };

  if (showStoryTeller) {
    const loreInfo = getChapterLore(selectedChapter.id);
    return (
      <div 
        className="w-full min-h-full flex flex-col items-center justify-center bg-[#080200] p-4 sm:p-8 rounded-3xl border border-[#ffcc33]/20 relative z-20 font-serif min-h-[580px] overflow-y-auto no-scrollbar"
        id="story_teller_screen"
      >
        {/* Parallax background glow */}
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(255,102,0,0.12)_0%,transparent_70%)] pointer-events-none" />
        
        {/* Swirling celestial cloud overlays */}
        <div className="absolute inset-0 bg-gradient-to-b from-purple-950/20 via-black/80 to-[#080200] pointer-events-none" />
        
        <div className="w-full max-w-2xl bg-[#0f0a1d]/90 backdrop-blur-md border-2 border-[#ffcc33]/30 p-6 sm:p-10 rounded-3xl relative flex flex-col gap-6 shadow-2xl relative overflow-hidden my-4 z-10">
          
          {/* Subtle faint temple silhouette background */}
          <div className="absolute inset-0 opacity-5 pointer-events-none flex items-center justify-center select-none">
            <svg viewBox="0 0 100 100" className="w-80 h-80 fill-amber-300">
              <polygon points="50,10 30,30 40,30 20,60 35,60 10,90 90,90 65,60 80,60 60,30 70,30" />
            </svg>
          </div>

          {/* Top Header */}
          <div className="text-center border-b border-[#ffcc33]/15 pb-4 relative z-10">
            <span className="text-[10px] font-mono tracking-[0.3em] text-[#ffcc33] uppercase">
              {loreInfo.tagline}
            </span>
            <h2 className="text-2xl sm:text-4xl font-black text-transparent bg-clip-text bg-gradient-to-r from-amber-200 via-[#ffcc33] to-orange-500 uppercase tracking-wide mt-2">
              {selectedChapter.name}
            </h2>
            <p className="text-sm font-sans font-bold text-orange-500 mt-1">
              {selectedChapter.nameTamil}
            </p>
          </div>

          {/* Epic story body */}
          <div className="flex-1 space-y-4 text-justify relative z-10 max-h-[250px] sm:max-h-none overflow-y-auto pr-1 no-scrollbar">
            <p className="text-sm sm:text-base text-stone-200 leading-relaxed font-sans first-letter:text-4xl first-letter:font-serif first-letter:font-black first-letter:text-[#ffcc33] first-letter:mr-2 first-letter:float-left">
              {loreInfo.lore}
            </p>
            <p className="text-xs sm:text-sm text-[#ffcc33]/85 leading-relaxed font-serif italic mt-3 border-t border-white/5 pt-3">
              "{loreInfo.tamil}"
            </p>

            {/* Core objective banner */}
            <div className="bg-[#241305] border border-orange-500/30 p-4 rounded-xl mt-4">
              <div className="text-[10px] font-mono uppercase text-orange-400 tracking-wider mb-1">
                Your Divine Quest (புனித நோக்கம்)
              </div>
              <div className="text-xs text-stone-300 leading-relaxed font-sans">
                🛡️ Fly through the temple sanctuary, evade corrupted traps, and strike down the <strong>{selectedChapter.guardian}</strong> inside!
              </div>
            </div>
          </div>

          {/* Buttons Footer */}
          <div className="flex flex-col sm:flex-row gap-3 items-center justify-center border-t border-[#ffcc33]/15 pt-5 relative z-10 mt-2">
            <button
              onClick={() => {
                AudioEngine.playScore();
                onLaunchChapter(selectedChapter.id);
              }}
              className="w-full sm:w-auto px-8 py-4 bg-gradient-to-r from-amber-500 via-orange-600 to-red-600 hover:from-amber-400 hover:to-red-500 text-black font-black font-sans text-sm uppercase tracking-widest rounded-xl shadow-lg hover:shadow-orange-500/20 transition-all hover:scale-[1.03] active:scale-[0.97] flex items-center justify-center gap-2 cursor-pointer border border-white/20"
            >
              <Play className="w-4 h-4 fill-black text-black" />
              <span>BEGIN FLIGHT / பறக்கத் தொடங்கு</span>
            </button>

            <button
              onClick={() => {
                AudioEngine.playButton();
                setShowStoryTeller(false);
              }}
              className="w-full sm:w-auto px-6 py-4 bg-black/60 border border-[#ffcc33]/35 hover:border-[#ffcc33] text-[#ffcc33] font-bold font-sans text-xs uppercase tracking-widest rounded-xl transition-all hover:bg-[#ffcc33]/5 flex items-center justify-center gap-1.5 cursor-pointer"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>BACK TO MAP</span>
            </button>
          </div>

        </div>
      </div>
    );
  }

  return (
    <div 
      className="w-full min-h-full flex flex-col md:flex-row bg-[#080200] overflow-hidden rounded-3xl border border-[#ffcc33]/20 relative z-20 min-h-[580px] no-scrollbar" 
      id="story_mode_portal"
    >
      {/* Mystical Animated Background Layer */}
      <div 
        className="absolute inset-0 bg-cover bg-center animate-ken-burns scale-110 pointer-events-none"
        style={{ backgroundImage: `url('/93325456-56c4-4cd8-b284-74a38095e2f7.jpg')` }}
      />
      
      {/* Atmosphere Overlays */}
      <div className="absolute inset-0 bg-black/40 backdrop-blur-[1px] pointer-events-none" />
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(255,165,0,0.1)_0%,transparent_80%)] animate-mystical-pulse pointer-events-none" />

      {/* Floating Divine Dust */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none z-0">
        {[...Array(20)].map((_, i) => (
          <div 
            key={i}
            className="absolute w-[1.5px] h-[1.5px] bg-amber-100/60 rounded-full animate-divine-float"
            style={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
              animationDelay: `${Math.random() * 5}s`,
              animationDuration: `${15 + Math.random() * 20}s`
            }}
          />
        ))}
      </div>

      {/* Parallax Dust & Flame Effects background overlay */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(255,102,0,0.06)_0%,transparent_70%)] pointer-events-none" />
      
      {/* LEFT MAP AREA */}
      <div className="flex-1 p-4 sm:p-6 flex flex-col relative border-b md:border-b-0 md:border-r border-[#ffcc33]/15 min-h-[350px] md:min-h-0 bg-black/30">
        
        {/* Header */}
        <div className="flex items-center justify-start mb-4 relative z-10">
          <button 
            onClick={handleBack}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-black/40 border border-[#ffcc33]/25 text-[#ffcc33] text-xs hover:bg-[#ffcc33]/10 transition cursor-pointer"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>முகப்பு (Menu)</span>
          </button>
        </div>

        {/* Map Grid Container */}
        <div className="flex-1 relative rounded-2xl border border-[#ffcc33]/10 bg-radial from-[#120500] to-[#040100] overflow-hidden flex items-center justify-center p-2 shadow-inner">
          {/* Subtle Grid Pattern */}
          <div className="absolute inset-0 bg-[linear-gradient(rgba(255,204,51,0.02)_1px,transparent_1px),linear-gradient(90deg,rgba(255,204,51,0.02)_1px,transparent_1px)] bg-[size:25px_25px]" />
          
          {/* SCRIPTED PATH LINES BETWEEN NODES */}
          <svg className="absolute inset-0 w-full h-full pointer-events-none z-0">
            {STORY_CHAPTERS.slice(0, 4).map((chap, idx) => {
              const nextChap = STORY_CHAPTERS[idx + 1];
              const isPathActive = currentCheckpoint > chap.id;
              return (
                <g key={`path-${chap.id}`}>
                  {/* Outer glowing path shadow */}
                  <line 
                    x1={`${chap.coordinates.x}%`} 
                    y1={`${chap.coordinates.y}%`} 
                    x2={`${nextChap.coordinates.x}%`} 
                    y2={`${nextChap.coordinates.y}%`}
                    stroke={isPathActive ? '#ffaa00' : 'rgba(255, 204, 51, 0.08)'}
                    strokeWidth={isPathActive ? 3 : 1.5}
                    strokeDasharray={isPathActive ? 'none' : '4, 4'}
                    className={isPathActive ? 'animate-pulse' : ''}
                  />
                </g>
              );
            })}
          </svg>

          {/* CHAPTER NODE BUTTONS */}
          {STORY_CHAPTERS.map((chap) => {
            const isUnlocked = currentCheckpoint >= chap.id;
            const isCompleted = currentCheckpoint > chap.id;
            const isSelected = selectedChapterId === chap.id;
            
            return (
              <button
                key={chap.id}
                onClick={() => handleChapterClick(chap.id)}
                className="absolute transform -translate-x-1/2 -translate-y-1/2 focus:outline-none transition-all duration-300 z-10 group cursor-pointer"
                style={{ left: `${chap.coordinates.x}%`, top: `${chap.coordinates.y}%` }}
              >
                {/* Node outer pulsing rings */}
                {isSelected && isUnlocked && (
                  <span className="absolute -inset-4 rounded-full border-2 border-dashed border-[#ffaa00]/80 animate-spin-slow" />
                )}
                {isUnlocked && !isCompleted && (
                  <span className="absolute -inset-3 rounded-full bg-[#ff5500]/20 animate-ping" style={{ animationDuration: '2s' }} />
                )}
                
                {/* Node circle */}
                <div className={`w-11 h-11 sm:w-13 sm:h-13 rounded-full flex items-center justify-center border-2 shadow-2xl transition-all ${
                  isCompleted 
                    ? 'bg-gradient-to-br from-amber-500 to-[#ff6600] border-amber-300 text-black shadow-amber-500/20' 
                    : isUnlocked 
                      ? 'bg-gradient-to-br from-red-600 to-amber-600 border-amber-400 text-white shadow-red-500/30' 
                      : 'bg-[#1a0a05] border-stone-800 text-stone-600 shadow-none'
                } ${isSelected ? 'scale-110 border-white ring-4 ring-[#ff9900]/30' : 'hover:scale-105'}`}>
                  {isCompleted ? (
                    <CheckCircle2 className="w-5 h-5 sm:w-6 sm:h-6" />
                  ) : isUnlocked ? (
                    <Flame className={`w-5 h-5 sm:w-6 sm:h-6 ${isSelected ? 'animate-bounce' : 'animate-pulse'}`} />
                  ) : (
                    <Lock className="w-4 h-4 sm:w-5 sm:h-5" />
                  )}
                  
                  {/* Roman or standard numeral indicator inside */}
                  <span className="absolute -bottom-5 left-1/2 -translate-x-1/2 text-[9px] font-mono font-bold tracking-wider text-stone-400 uppercase group-hover:text-white transition-colors truncate max-w-[80px]">
                    ACT {chap.id}
                  </span>
                </div>
              </button>
            );
          })}

          {/* Completed Myth Banner overlay if whole game cleared! */}
          {isStoryCompleted && (
            <div className="absolute top-4 left-1/2 -translate-x-1/2 bg-gradient-to-r from-amber-500/90 to-red-500/90 border border-amber-300 px-4 py-1.5 rounded-full text-black font-sans font-black text-xs uppercase tracking-widest flex items-center gap-2 animate-bounce shadow-xl">
              <Trophy className="w-4 h-4 text-black animate-pulse" />
              <span>Story Complete • Endless Myth Unlocked!</span>
            </div>
          )}
        </div>
      </div>

      {/* RIGHT SIDEBAR PANEL: CHAPTER DETAILS */}
      <div className="w-full md:w-[350px] p-4 sm:p-6 flex flex-col justify-between bg-black/60 backdrop-blur-xl relative z-10">
        
        {/* Selected Chapter content */}
        <div className="flex-1 flex flex-col">
          <div className="border-b border-[#ffcc33]/15 pb-3 mb-4">
            <div className="text-[10px] font-mono text-[#ffcc33] tracking-widest uppercase mb-1">
              Currently Selected
            </div>
            <h3 className="text-xl sm:text-2xl font-black text-white leading-tight uppercase flex items-center gap-2">
              <Compass className="w-5 h-5 text-amber-500 animate-spin-slow" />
              <span>{selectedChapter.name}</span>
            </h3>
            <span className="text-sm font-bold font-sans text-[#ff6600]">
              {selectedChapter.nameTamil}
            </span>
          </div>

          <div className="flex-1 overflow-y-auto pr-1 space-y-4 max-h-[220px] sm:max-h-none">
            {/* Description Paragraph */}
            <div>
              <p className="text-xs sm:text-sm text-[#fff8e1]/90 leading-relaxed text-justify italic">
                "{selectedChapter.description}"
              </p>
              <p className="text-[11px] text-[#ffcc33]/70 leading-relaxed text-justify mt-2">
                "{selectedChapter.descriptionTamil}"
              </p>
            </div>

            {/* Guardian Detail Box */}
            <div className="p-3 rounded-xl bg-black/45 border border-red-500/20">
              <div className="text-[9px] font-mono uppercase tracking-widest text-red-400 mb-1">
                Land Guardian (ஆளுமைத் தெய்வம்)
              </div>
              <div className="text-xs font-bold text-white uppercase tracking-wide flex items-center gap-1.5">
                👹 {selectedChapter.guardian}
              </div>
              <div className="text-[10px] text-red-300 font-sans mt-0.5">
                {selectedChapter.guardianTamil}
              </div>
            </div>

            {/* Unlockable Bird Reward */}
            <div className="p-3 rounded-xl bg-black/45 border border-emerald-500/20">
              <div className="text-[9px] font-mono uppercase tracking-widest text-emerald-400 mb-1">
                Avian Unlock Reward (பறவைப் பரிசு)
              </div>
              <div className="text-xs font-bold text-white uppercase tracking-wide flex items-center gap-1.5">
                🪶 {selectedChapter.unlockSkinName}
              </div>
              <div className="text-[10px] text-emerald-300 font-sans mt-0.5">
                {selectedChapter.unlockedSkinTamil}
              </div>
            </div>

            {/* Level Bonus Feathers */}
            <div className="flex items-center gap-2 text-xs font-mono text-[#ffcc33]/90 bg-amber-500/10 px-3 py-2 rounded-lg border border-amber-500/25">
              <span>Sacred Completion Tribute:</span>
              <strong className="text-white">🪶 {selectedChapter.rewardFeathers} Feathers</strong>
            </div>
          </div>
        </div>

        {/* Story Action Controls at bottom */}
        <div className="mt-4 pt-4 border-t border-[#ffcc33]/15 flex flex-col gap-2">
          {/* Main Chapter play button */}
          <button
            onClick={handleLaunch}
            className="w-full group py-4 px-6 bg-gradient-to-r from-amber-500 via-orange-600 to-red-600 hover:from-amber-400 hover:to-red-500 text-black font-black font-sans text-xs sm:text-sm uppercase tracking-widest rounded-2xl shadow-[0_10px_25px_rgba(239,68,68,0.3)] hover:shadow-orange-500/40 transition-all hover:scale-[1.02] active:scale-[0.98] flex items-center justify-center gap-3 cursor-pointer border border-white/30 relative z-10"
          >
            <Play className="w-5 h-5 fill-black text-black shrink-0" />
            <span className="truncate">பறக்கத் தொடங்கு (Fly Chapter)</span>
          </button>

          {/* Extra: final ending cinematic trigger if story completely finished */}
          {isStoryCompleted && (
            <button
              onClick={onPlayEnding}
              className="w-full py-2 px-4 bg-black/55 border border-amber-400/50 hover:bg-amber-400/10 text-amber-300 font-semibold font-sans text-xs uppercase tracking-widest rounded-xl transition cursor-pointer flex items-center justify-center gap-1.5"
            >
              <Trophy className="w-3.5 h-3.5" />
              <span>Watch Final Ending (முழு முடிவு)</span>
            </button>
          )}

          <div className="text-[9px] text-white/50 text-center font-mono mt-1">
            Checkpoint: Land {currentCheckpoint > 5 ? '5 Completed' : currentCheckpoint} of 5
          </div>
        </div>

      </div>
    </div>
  );
};
