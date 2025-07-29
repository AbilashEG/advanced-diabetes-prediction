# 🧠 Advanced Diabetes Prediction System

An AI-powered web application that predicts **diabetes risk** and provides **personalized health recommendations** using a machine learning model trained on clinical and lifestyle features.

![License](https://img.shields.io/badge/license-MIT-green)
![Made with AWS](https://img.shields.io/badge/AWS-SageMaker-blue)
![Status](https://img.shields.io/badge/status-Deployed%20Locally%20%26%20SageMaker-success)

---

## 🚀 Project Overview

This system uses an advanced ML model trained with real-world health data to:

- Predict if a person is at risk of diabetes (Low, Moderate, High).
- Generate actionable recommendations based on risk.
- Provide real-time predictions via a hosted **SageMaker endpoint**.
- Offer an interactive UI built with React + Node.js backend.

---

## 🧠 Key Features

- ✅ Predict diabetes risk before onset (early detection).
- 📊 ML Model Accuracy: **94.5%**
- 🧾 Risk levels: High, Low
- 📈 Personalized diet, lifestyle & monitoring plans
- 🔗 Real-time predictions with AWS SageMaker
- 🔐 Local deployment for privacy-first testing

---

## ⚙️ Tech Stack

| Layer | Technology |
|------|-------------|
| 🖥️ Frontend | React.js |
| 🌐 Backend | Node.js |
| 🤖 ML Deployment | AWS SageMaker |
| 📦 Model Format | Pickle (.pkl) |
| 🧪 Testing Tool | Postman / Web UI |
| ☁️ Cloud | AWS S3, SageMaker |
| 🔒 Auth (Optional) | Local-only access |

---

## 📂 Folder Structure


diabetes-prediction-app/
├── backend/                # Node.js backend (API logic)
├── frontend/               # React app (user interface)
├── inference.py            # SageMaker inference script
├── enhanced_diabetes_model_v2.pkl  # Trained model
├── requirements.txt        # Python dependencies
└── README.md               # Project documentation


---

## 🛠️ How to Run Locally

```bash
# 1. Clone the repository
git clone https://github.com/AbilashEG/advanced-diabetes-prediction.git

# 2. Navigate to backend and install dependencies
cd backend
npm install

# 3. Navigate to frontend and install dependencies
cd ../frontend
npm install

# 4. Start frontend and backend separately
npm start              # in /frontend
npm run dev            # in /backend
```

---

## 🌐 SageMaker Deployment

- Model trained and exported as `.pkl`
- Packaged with `inference.py`
- Uploaded to **S3** and deployed via **SKLearnModel**
- Endpoint used in `backend/.env` as:
<img width="307" height="372" alt="Screenshot 2025-07-29 105305" src="https://github.com/user-attachments/assets/a835e4b5-8123-4f8b-a152-36d4f31341b3" />

```env
SAGEMAKER_ENDPOINT=diabetes-prediction-endpoint-corrected-20250728-064405
```

---

## 🧪 Sample Test Output

```json
{
  "prediction": 1,
  "risk_level": "High Risk",
  "probability": 0.94,
  "recommendations": {
    "diet": ["Follow low-carb diet", "Limit sugar intake"],
    "exercise": ["150+ minutes moderate exercise weekly", "Strength training 2-3x/week"],
    "lifestyle": ["Regular sleep", "Manage stress"],
    "monitoring": ["Monitor blood glucose daily", "Check HbA1c every 3 months"]
  }
}
```

---

## 📸 Screenshots
<img width="1841" height="951" alt="Screenshot 2025-07-28 173037" src="https://github.com/user-attachments/assets/87070fed-3a1a-49d7-8e42-12a11e2eb7a5" />
<img width="1819" height="918" alt="Screenshot 2025-07-28 151031" src="https://github.com/user-attachments/assets/18ca797b-7ede-4d35-ab89-fd5973c64ade" />
<img width="1829" height="925" alt="Screenshot 2025-07-28 173212" src="https://github.com/user-attachments/assets/d5642281-4830-44e8-86f8-df2ae4222d6f" />
<img width="1769" height="917" alt="Screenshot 2025-07-28 173222" src="https://github.com/user-attachments/assets/a29aeed1-3477-429d-9b62-901cf39880fc" />


> Include screenshots of:
> - Prediction form (React UI)
> - Recommendation output
> - Terminal logs
> - SageMaker dashboard

---

## 👤 Author

**Abilash EG**  
Data & ML Engineer | AWS Developer | React & Node Enthusiast  
📬 [GitHub Profile](https://github.com/AbilashEG)

---

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

---

_Last updated: 2025-07-29 10:03:55_
