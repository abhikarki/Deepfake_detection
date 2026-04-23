### Deepfake Detection System - Temporal Based Approach
An end-to-end deepfake video detection system on the FaceForensics++ dataset (2,000 videos).

### System Architecture
<img width="2365" height="840" alt="system_architecture_stage_3" src="https://github.com/user-attachments/assets/8873efff-4db0-451b-bf9a-6e5a2312af8d" />

### Model Evaluation
A temporal CNN was trained and tested on inter-frame difference vectors (ResNeXt-50 embeddings, 2048-dim) using 5-frame windows to exploit artifacts invisible to per-frame models. For baseline comparison a frame-based Model was trained and tested on the same dataset with same preprocessing. <br>
**Fairness in Comparison:** Same dataset and exact same split (same 80% for training, same 10% for validation,
and same 10% for testing) was used to train and test the baseline model. 

#### Results:

| Temporal CNN Model | Baseline Frame-based Model |
|-------------------|---------------------------|
| **Accuracy**:  0.9000 (90.00%)<br>**Precision**: 0.8774<br>**Recall**: 0.9300<br>**F1 score**: 0.9029<br>**AUC-ROC**: 0.9374<br>**AUC-PR**: 0.9381<br>**FPR**: 0.1300 (real videos flagged as fake)<br>**FNR**: 0.0700 (fake videos missed) | **Accuracy**: 0.8800 (88.00%)<br>**Precision**: 0.8958<br>**Recall**: 0.8600<br>**F1 score**: 0.8776<br>**AUC-ROC**: 0.9315<br>**AUC-PR**: 0.9435<br>**FPR**: 0.1000 (real videos flagged as fake)<br>**FNR**: 0.1400 (fake videos missed) |


