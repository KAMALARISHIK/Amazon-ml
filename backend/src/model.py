import os
import joblib
import numpy as np
from sklearn.ensemble import GradientBoostingClassifier
from src.config import settings

MODEL_FILE = os.path.join(settings.MODELS_DIR, "matcher_model.joblib")

class EntityMatcherModel:
    def __init__(self):
        self.model = None
        self._load_or_train_default_model()

    def _load_or_train_default_model(self):
        if os.path.exists(MODEL_FILE):
            try:
                self.model = joblib.load(MODEL_FILE)
                return
            except Exception:
                pass

        # Train robust baseline GradientBoostingClassifier on synthetic seed patterns
        self.model = GradientBoostingClassifier(
            n_estimators=100,
            learning_rate=0.1,
            max_depth=4,
            random_state=42
        )
        
        # Synthetic training data representing entity match vs non-match features
        # Features: [name_jw, name_lev, name_fuzz, name_tok_sort, name_tok_set, name_part, addr_lev, addr_tok_sort, addr_tok_set, country, tax, len_diff]
        X_train = np.array([
            # Positive Matches
            [0.98, 0.95, 0.96, 0.97, 0.99, 0.95, 0.92, 0.90, 0.95, 1.0, 1.0, 0.05],
            [0.92, 0.88, 0.89, 0.94, 0.96, 0.90, 0.85, 0.88, 0.90, 1.0, 0.0, 0.10],
            [0.95, 0.90, 0.92, 0.95, 0.98, 0.95, 0.96, 0.95, 0.98, 1.0, 1.0, 0.08],
            [0.89, 0.85, 0.86, 0.92, 0.95, 0.88, 0.80, 0.82, 0.85, 1.0, 0.0, 0.15],
            [0.85, 0.80, 0.82, 0.88, 0.94, 0.92, 0.78, 0.80, 0.88, 1.0, 0.0, 0.12],
            [0.97, 0.94, 0.95, 0.98, 1.00, 0.98, 0.94, 0.92, 0.96, 1.0, 1.0, 0.02],
            [0.88, 0.84, 0.85, 0.90, 0.92, 0.88, 0.88, 0.90, 0.92, 1.0, 0.0, 0.10],
            
            # Negative Non-Matches
            [0.45, 0.35, 0.40, 0.42, 0.45, 0.40, 0.30, 0.25, 0.30, 0.0, 0.0, 0.50],
            [0.60, 0.52, 0.55, 0.58, 0.60, 0.65, 0.40, 0.35, 0.40, 1.0, 0.0, 0.40],
            [0.30, 0.25, 0.28, 0.30, 0.35, 0.30, 0.20, 0.15, 0.20, 0.0, 0.0, 0.70],
            [0.55, 0.48, 0.50, 0.52, 0.55, 0.60, 0.50, 0.45, 0.50, 0.0, 0.0, 0.35],
            [0.72, 0.65, 0.68, 0.70, 0.75, 0.72, 0.30, 0.25, 0.30, 0.0, 0.0, 0.45],
            [0.68, 0.60, 0.62, 0.65, 0.70, 0.68, 0.45, 0.40, 0.45, 1.0, 0.0, 0.30],
            [0.40, 0.30, 0.35, 0.38, 0.40, 0.45, 0.25, 0.20, 0.25, 1.0, 0.0, 0.60],
        ], dtype=np.float32)
        
        y_train = np.array([1, 1, 1, 1, 1, 1, 1, 0, 0, 0, 0, 0, 0, 0], dtype=np.int32)
        
        self.model.fit(X_train, y_train)
        
        try:
            joblib.dump(self.model, MODEL_FILE)
        except Exception:
            pass

    def predict_probabilities(self, X: np.ndarray) -> np.ndarray:
        if X.shape[0] == 0:
            return np.array([])
        return self.model.predict_proba(X)[:, 1]

matcher_model = EntityMatcherModel()
