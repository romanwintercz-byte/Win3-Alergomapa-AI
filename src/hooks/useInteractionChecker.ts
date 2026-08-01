import { useMemo } from 'react';
import { useAppContext } from '../store';
import { INTERACTION_RULES } from '../data/interactions';
import { InteractionResult, UserProfile } from '../types';

export const checkInteractions = (profile: UserProfile | undefined): InteractionResult[] => {
  if (!profile) return [];

  const results: InteractionResult[] = [];
  
  // Získání uživatelských dat pro porovnání
  const userMedications = profile.medications?.map(m => m.name.toLowerCase()) || [];
  
  // Zahrneme sledované (pyly), vlastní alergeny a názvy z profilu
  const userAllergiesAndDiets = [
    ...profile.trackedAllergens.map(a => a.toLowerCase()),
    ...profile.customAllergens.map(a => a.name.toLowerCase())
  ];

  // Pomocná funkce pro vyhledání shody s klíčovými slovy
  const findMatch = (type: string, keywords: string[]): string | undefined => {
    const items = type === 'medication' || type === 'supplement' 
      ? userMedications 
      : userAllergiesAndDiets;
      
    for (const item of items) {
      if (keywords.some(kw => item.includes(kw.toLowerCase()))) {
        return item;
      }
    }
    return undefined;
  };

  INTERACTION_RULES.forEach(rule => {
    const triggerMatch = findMatch(rule.triggerType, rule.triggerKeywords);
    const targetMatch = findMatch(rule.targetType, rule.targetKeywords);

    // Pokud najdeme shodu v obou kategoriích (např. Lék A a Lék B, Lék a zadaná potravina)
    if (triggerMatch && targetMatch && triggerMatch !== targetMatch) {
      results.push({
        ruleId: rule.id,
        severity: rule.severity,
        message: rule.message,
        timeSpacingHours: rule.timeSpacingHours,
        triggerMatch,
        targetMatch,
        description: rule.description
      });
    } 
    // Preventivní upozornění pouze na základě triggeru (např. uživatel bere lék, který se nesmí s mlékem)
    // Zobrazíme upozornění, i když nemá mléko zapsané v profilu.
    else if (triggerMatch && (rule.targetType === 'diet' || rule.targetType === 'supplement')) {
       const isPreventiveWarning = !targetMatch && (rule.triggerType === 'medication' || rule.triggerType === 'supplement');
       
       if (isPreventiveWarning) {
          results.push({
            ruleId: rule.id,
            severity: rule.severity,
            message: rule.message,
            timeSpacingHours: rule.timeSpacingHours,
            triggerMatch,
            targetMatch: rule.targetKeywords.join(", "),
            description: rule.description
          });
       }
    } 
    // Zkřížené reakce u alergií - preventivní varování
    else if (triggerMatch && rule.triggerType === 'allergy' && rule.targetType === 'diet') {
        results.push({
          ruleId: rule.id,
          severity: rule.severity,
          message: rule.message,
          triggerMatch,
          targetMatch: rule.targetKeywords.join(", "),
          description: rule.description
        });
    }
  });

  // Deduplikace výsledků podle ruleId (aby se nezobrazovaly duplicity)
  const uniqueResults = Array.from(new Map(results.map(item => [item.ruleId, item])).values());
  
  // Seřazení podle závažnosti
  return uniqueResults.sort((a, b) => {
    const weight = { CRITICAL: 3, WARNING: 2, INFO: 1 };
    return weight[b.severity] - weight[a.severity];
  });
};

export const useInteractionChecker = (profileId: string) => {
  const { profiles } = useAppContext();
  const profile = profiles.find(p => p.id === profileId);

  return useMemo(() => checkInteractions(profile), [profile]);
};
