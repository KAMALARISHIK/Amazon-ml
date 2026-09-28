"use client";

import React, { createContext, useContext, useState, ReactNode } from "react";
import { MatchingJobConfig, MatchingJob } from "@/types/api";
import { api } from "@/lib/api-client";

interface PipelineContextType {
  jobConfig: MatchingJobConfig;
  setJobConfig: React.Dispatch<React.SetStateAction<MatchingJobConfig>>;
  activeJob: MatchingJob | null;
  setActiveJob: (job: MatchingJob | null) => void;
  isTriggering: boolean;
  triggerMatchingJob: () => Promise<MatchingJob>;
  resetToDefaults: () => void;
}

const DEFAULT_JOB_CONFIG: MatchingJobConfig = {
  classifier_type: "hybrid_ensemble",
  similarity_threshold: 0.78,
  active_features: {
    jaro_winkler_name: true,
    levenshtein_address: true,
    jaccard_token: true,
    country_exact_match: true,
    tax_id_match: true,
    embedding_cosine: true,
  },
  weight_name: 0.45,
  weight_address: 0.35,
  weight_tax: 0.20,
  transitive_closure: true,
};

const PipelineContext = createContext<PipelineContextType | undefined>(undefined);

export function PipelineProvider({ children }: { children: ReactNode }) {
  const [jobConfig, setJobConfig] = useState<MatchingJobConfig>(DEFAULT_JOB_CONFIG);
  const [activeJob, setActiveJob] = useState<MatchingJob | null>(null);
  const [isTriggering, setIsTriggering] = useState<boolean>(false);

  const triggerMatchingJob = async (): Promise<MatchingJob> => {
    setIsTriggering(true);
    try {
      const job = await api.triggerMatchingJob(jobConfig);
      setActiveJob(job);
      return job;
    } finally {
      setIsTriggering(false);
    }
  };

  const resetToDefaults = () => {
    setJobConfig(DEFAULT_JOB_CONFIG);
  };

  return (
    <PipelineContext.Provider
      value={{
        jobConfig,
        setJobConfig,
        activeJob,
        setActiveJob,
        isTriggering,
        triggerMatchingJob,
        resetToDefaults,
      }}
    >
      {children}
    </PipelineContext.Provider>
  );
}

export function usePipeline() {
  const context = useContext(PipelineContext);
  if (!context) {
    throw new Error("usePipeline must be used within a PipelineProvider");
  }
  return context;
}
