import pandas as pd
import matplotlib.pyplot as plt
import seaborn as sns

# --- Data Loading and Cleaning ---

try:
    # Load the dataset
    df = pd.read_csv(r'C:\Users\coad1\OneDrive\Desktop\Thesis Figures and descriptions\data\Masterchart.csv')

    # The first few columns are unnamed and empty, let's find the first valid column
    first_valid_col = df.columns[df.columns.str.contains('Histopathological', case=False, na=False)][0]
    df = df.loc[:, first_valid_col:] # Keep columns from the first valid one onwards

    # Clean column names by stripping whitespace
    df.columns = df.columns.str.strip()

    # Drop rows where 'Histopathological diagnosis' is NaN, as they are likely empty rows
    df.dropna(subset=['Histopathological diagnosis'], inplace=True)

    # Clean the 'Histopathological diagnosis' column
    df['Histopathological diagnosis'] = df['Histopathological diagnosis'].str.strip().str.lower()

    # Clean 'Drug history'
    df['Drug history'] = df['Drug history'].str.strip().str.lower()
    # Standardize values in 'Drug history'
    df['Drug history'] = df['Drug history'].replace({
        'no': 'No Hormonal Intake',
        'hormonal intake': 'Hormonal Intake'
    })

    # Convert 'Age' to numeric, coercing errors
    df['Age'] = pd.to_numeric(df['Age'], errors='coerce')
    df.dropna(subset=['Age'], inplace=True) # Drop rows where age could not be converted
    df['Age'] = df['Age'].astype(int)

    # --- Analysis and Visualization ---

    # Set plot style
    sns.set_style("whitegrid")
    plt.rcParams['figure.figsize'] = (12, 8)
    plt.rcParams['axes.titlesize'] = 18
    plt.rcParams['axes.labelsize'] = 14

    # 1. Distribution of Histopathological Diagnoses
    plt.figure()
    diag_counts = df['Histopathological diagnosis'].value_counts()
    sns.barplot(x=diag_counts.index, y=diag_counts.values, palette='viridis')
    plt.title('Distribution of Histopathological Diagnoses')
    plt.xlabel('Diagnosis')
    plt.ylabel('Number of Cases')
    plt.xticks(rotation=45, ha='right')
    plt.tight_layout()
    plt.savefig(r"C:\Users\coad1\OneDrive\Desktop\Thesis Figures and descriptions\figures\histopathological_diagnoses.png")
    print("Generated 'histopathological_diagnoses.png' in figures folder")

    # 2. Age Distribution of Patients
    plt.figure()
    sns.histplot(df['Age'], bins=20, kde=True, color='teal')
    plt.title('Age Distribution of Patients with AUB')
    plt.xlabel('Age')
    plt.ylabel('Frequency')
    plt.tight_layout()
    plt.savefig(r"C:\Users\coad1\OneDrive\Desktop\Thesis Figures and descriptions\figures\age_distribution.png")
    print("Generated 'age_distribution.png' in figures folder")

    # 3. Common Presenting Complaints
    plt.figure()
    complaint_counts = df['Compalints'].value_counts()
    sns.barplot(y=complaint_counts.index, x=complaint_counts.values, palette='plasma', orient='h')
    plt.title('Most Common Presenting Complaints')
    plt.xlabel('Number of Cases')
    plt.ylabel('Complaint')
    plt.tight_layout()
    plt.savefig(r"C:\Users\coad1\OneDrive\Desktop\Thesis Figures and descriptions\figures\common_complaints.png")
    print("Generated 'common_complaints.png' in figures folder")

    # 4. Histopathological Diagnosis by Age Group
    df['Age Group'] = pd.cut(df['Age'], bins=[0, 30, 40, 50, 100], labels=['<30', '30-40', '40-50', '50+'])
    age_diag_crosstab = pd.crosstab(df['Age Group'], df['Histopathological diagnosis'])

    # Normalize to see percentages
    age_diag_crosstab_norm = age_diag_crosstab.div(age_diag_crosstab.sum(axis=1), axis=0)

    plt.figure(figsize=(16, 10))
    age_diag_crosstab_norm.plot(kind='bar', stacked=True, colormap='tab20')
    plt.title('Histopathological Diagnosis by Age Group')
    plt.xlabel('Age Group')
    plt.ylabel('Proportion of Cases')
    plt.xticks(rotation=0)
    plt.legend(title='Diagnosis', bbox_to_anchor=(1.05, 1), loc='upper left')
    plt.tight_layout()
    plt.savefig(r"C:\Users\coad1\OneDrive\Desktop\Thesis Figures and descriptions\figures\diagnosis_by_age_group.png")
    print("Generated 'diagnosis_by_age_group.png' in figures folder")

    # 5. Correlation Heatmap
    # Create a copy for encoding
    df_corr = df.copy()

    # Convert categorical columns to numerical using factorize
    for col in ['Histopathological diagnosis', 'Age Group', 'Compalints', 'Drug history', 'correlation with LMP']:
        if col in df_corr.columns:
            df_corr[col] = pd.factorize(df_corr[col])[0]

    plt.figure(figsize=(12, 10))
    correlation_matrix = df_corr[['Age', 'Histopathological diagnosis', 'Compalints', 'Drug history', 'correlation with LMP']].corr()
    sns.heatmap(correlation_matrix, annot=True, cmap='coolwarm', fmt=".2f")
    plt.title('Correlation Heatmap of Key Variables')
    plt.tight_layout()
    plt.savefig(r"C:\Users\coad1\OneDrive\Desktop\Thesis Figures and descriptions\figures\correlation_heatmap.png")
    print("Generated 'correlation_heatmap.png' in figures folder")

except FileNotFoundError:
    print("Error: 'Masterchart.csv' not found. Please ensure the file is in the correct directory.")
except Exception as e:
    print(f"An error occurred during analysis: {e}")