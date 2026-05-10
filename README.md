# Deepfake Detection: An Artifact-Based Approach

An explainable deepfake detection framework that leverages **temporal modeling** to overcome limitations of frame-level analysis. This system integrates video preprocessing, facial detection, feature extraction, and CNN-based temporal aggregation to classify videos as real or fake with interpretable outputs.

## Problem Statement

Existing deepfake detection systems face two critical limitations:

1. **Frame-level analysis**: Most systems treat each frame independently, ignoring temporal relationships that are key to detecting subtle artifacts
2. **Lack of interpretability**: Systems function as black-boxes, providing only a verdict without explaining which parts of the video drove the decision

This project aims to address both challenges through temporal consistency analysis and explainability, making it suitable for high-stakes applications like legal verification and investigative journalism.

## System Architecture

<img width="2365" height="840" alt="system_architecture_stage_3" src="https://github.com/user-attachments/assets/8873efff-4db0-451b-bf9a-6e5a2312af8d" />

## Performance Results

### Dataset

The system is trained and evaluated using the **FaceForensics++ (C23 compression)** dataset, containing 1,000 original videos and 1,000 deepfake videos generated using the autoencoder-based face-swap technique. All videos were preprocessed through the complete pipeline: FFmpeg decoding at 10 FPS with light denoising, RetinaFace face detection, OpenCV-based cropping and geometric alignment, and ResNeXt-50 feature extraction (final classification head removed, producing 2048-dimensional embeddings per frame). The feature vectors were split at the video level into 80% training, 10% validation, and 10% test sets.

### Baseline Comparison & Fairness

To ensure a fair and rigorous evaluation, the proposed temporal CNN was compared against a frame-level MLP baseline. Both models were trained from scratch on **identical data with the exact same train/validation/test split**, eliminating factors such as preprocessing differences or data distribution variations. This approach differs from using external third-party models and provides a controlled comparison where the only variable is the temporal modeling strategy.

The baseline model (SimpleFrameMLP) takes individual 2048-dimensional frame embeddings as input, passes them through two fully-connected layers (2048→256→1) with ReLU activation, and produces frame-level predictions that are mean-pooled to generate video-level classifications. Videos with deepfake probabilities ≥0.50 were classified as deepfake.

### Results

| Metric                  | Temporal CNN | Baseline (Frame-based) |
| ----------------------- | ------------ | ---------------------- |
| **Accuracy**            | 90.00%       | 88.00%                 |
| **Precision**           | 0.8774       | 0.8958                 |
| **Recall**              | 0.9300       | 0.8600                 |
| **F1-score**            | 0.9029       | 0.8776                 |
| **AUC-ROC**             | 0.9374       | 0.9315                 |
| **AUC-PR**              | 0.9381       | 0.9435                 |
| **False Negative Rate** | 7.0%         | 14.0%                  |
| **False Positive Rate** | 13.0%        | 10.0%                  |

**Key Finding**: The temporal CNN achieves significantly better recall (93% vs 86%), reducing false negatives by half. This is critical for high-stakes applications where missed deepfakes have serious consequences.

### Visualization: AUC-ROC and Confusion Matrix

The following graphs demonstrate the discriminative ability of both models:


<table>
  <tr>
    <td width="50%">
      <img width="947" height="707" alt="temp_cnn_roc" src="https://github.com/user-attachments/assets/dadb1a47-2df1-4fab-a511-e62cb9ab8710" />
      <!-- <img alt="auc_roc_temporal_cnn" src="" width="100%" /> -->
    </td>
    <td width="50%">
      <img width="604" height="470" alt="baseline_roc_pr" src="https://github.com/user-attachments/assets/fc8141a7-e729-4e62-9ca6-98cf7e346418" />
      <!-- <img alt="auc_roc_baseline" src="[INSERT_AUC_ROC_BASELINE_IMAGE_URL]" width="100%" /> -->
    </td>
  </tr>
  <tr>
    <td align="center"><strong>Temporal CNN AUC-ROC: 0.9374</strong></td>
    <td align="center"><strong>Baseline AUC-ROC: 0.9315</strong></td>
  </tr>
</table>

The AUC-ROC curves demonstrate that the temporal CNN achieves superior distinction between real and deepfake videos across all classification thresholds. The higher area under the curve (0.9374 vs 0.9315) indicates that the temporal model is more effective at ranking deepfake videos higher than real videos, making it more reliable for threshold-based classification in practical deployments.

<table>
  <tr>
    <td width="50%">
      <img width="707" height="587" alt="temp_cnn_confusion_matrix" src="https://github.com/user-attachments/assets/480d5ff6-76a5-40e6-b129-2c595c70c9c3" />
    </td>
    <td width="50%">
      <img width="468" height="390" alt="baseline_confusion_matrix" src="https://github.com/user-attachments/assets/a9034bbf-9e92-4155-9a44-9a3a7c91b9aa" />
    </td>
  </tr>
  <tr>
    <td align="center"><strong>Temporal CNN Confusion Matrix</strong></td>
    <td align="center"><strong>Baseline Confusion Matrix</strong></td>
  </tr>
</table>

The confusion matrices reveal the trade-offs between the two approaches. While the temporal CNN has a slightly higher false positive rate (13% vs 10%), it dramatically reduces false negatives from 14% to 7%. In high-stakes applications such as legal verification and investigative journalism, this trade-off is justified because missing a deepfake carries far greater consequences than falsely flagging a real video for manual review.

### Backend Setup

```bash
cd backend
pip install -r requirements.txt
python main.py
```

### Frontend Setup

```bash
cd frontend
npm install
npm start
```

### Future Enhancements

- Cross-dataset evaluation on Face2Face, FaceSwap, and other manipulation methods
- Exploration of LSTM and GRU architectures
- Threshold calibration to improve precision-recall tradeoff
- Real-time streaming inference for live video analysis
- Ensemble methods combining multiple temporal models

## Ethical Considerations

- **False Positives & Real-World Harm**: System provides confidence scores and flags low-confidence predictions for mandatory human review rather than automatic flagging. By combining automated detection with human oversight, it ensures that no individual is wrongfully accused based solely on machine decisions. The system is designed as a decision support tool, not a replacement for human judgment in high-stakes scenarios.

- **Dataset Bias & Responsible Deployment**: The current system is trained on a subset of the FaceForensics++ dataset. Responsible deployment requires rigorous evaluation across diverse datasets and manipulation methods to ensure the system performs equitably and does not exhibit disparate performance across different demographic groups, video qualities, or manipulation methods. 

- **Evolving Threat Landscape**: Deepfake generation techniques continue to evolve rapidly, particularly with the rise of adversarial methods designed to bypass standard classifiers. No detection system should be treated as a permanent or complete solution. The modular architecture of this system is specifically designed to address this reality; components can be updated independently, so that the system can evolve alongside the manipulation techniques.

- **Dual-Use Implications & Responsible AI**: Making this system open-source maximizes its benefit to legitimate users . However, open-source availability also exposes the system's detection logic to adversaries who may seek to defeat it. This dual-use consideration requires that developers and deployers of such systems maintain awareness of potential misuse.
  
## License

MIT
