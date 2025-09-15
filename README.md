# Histopathological Patterns in Abnormal Uterine Bleeding - A Thesis

This repository contains the complete research thesis, "Histopathological Patterns in Abnormal Uterine Bleeding," along with all supplementary materials, including the dataset, figures, and final manuscript.

## Introduction

Abnormal Uterine Bleeding (AUB) is a common and significant health issue affecting women across different age groups. This research provides a comprehensive analysis of the various histopathological patterns found in the endometrial samples of patients presenting with AUB.

The primary objective of this study is to correlate these pathological findings with key clinical parameters such as age, menstrual history (LMP), parity, and hormonal drug intake. By identifying significant patterns and relationships, this work aims to enhance the diagnostic and management strategies for AUB.

## Repository Structure

This repository is organized into several directories to ensure that all research materials are easy to locate and access:

-   **`/manuscript`**: Contains the full text of the thesis, including the introduction, literature review, methodology, results, discussion, and conclusion.
-   **`/data`**: Includes the raw dataset (`Masterchart.xlsx`) used for the statistical analysis in this study.
-   **`/figures`**: A collection of all figures, charts, and histopathological images referenced in the manuscript.
-   **`/final_outputs`**: The final, compiled versions of the thesis and synopsis in PDF format.
-   **`/website`**: The source code for the accompanying Quartz-based research website that presents this work.
-   **`/scripts`**: Contains any scripts used for data processing or analysis.
-   **`/archive`**: Miscellaneous or archived files that are not part of the main thesis but are preserved for reference.

## Key Findings

-   The study identifies the prevalence of various histopathological patterns in AUB, ranging from normal cyclical changes to endometrial hyperplasia and carcinoma.
-   A strong positive correlation was found between histopathological diagnosis and the last menstrual period (LMP), highlighting the importance of menstrual history in interpreting endometrial histology.
-   A significant correlation was also observed between histopathological findings and patient age, indicating that pathological changes are more common in older age groups.
-   The research underscores that clinical symptoms alone are not reliable predictors of underlying endometrial pathology, reinforcing the need for routine histopathological evaluation.

## Usage

To explore this research, you can:
1.  Read the full thesis in the **`/manuscript`** directory.
2.  Review the final compiled documents in the **`/final_outputs`** directory.
3.  Examine the figures and images in the **`/figures`** directory.
4.  Access the raw data for your own analysis from the **`/data`** directory.

### Ask the Thesis (Interactive Q&A)

The dashboard includes a local, privacy-preserving "Ask the Thesis" feature that answers natural language questions by retrieving relevant passages from the manuscript (no external API calls or LLM usage).

Build or refresh the search index whenever you update files in `/manuscript`:

```
cd "c:/Users/coad1/OneDrive/Desktop/Thesis Figures and descriptions/scripts"
python build_thesis_index.py
```

This generates/overwrites `dashboard/thesis_index.json`.

Open/reload the dashboard (e.g. via `enhanced_server.py`) and ask questions like:
- What were the exclusion criteria?
- How was data collected?
- What statistical methods were used?
- Summarize the main findings.

How it works (technical summary):
- A Python script tokenizes paragraphs and computes TF (term frequency) + IDF.
- The client loads `thesis_index.json`, tokenizes the user query, computes a TF-IDF vector, and scores passages via cosine similarity.
- Top passages are lightly summarized by sentence selection with inline citations `[S1]`, `[S2]`.

If you see "Index Not Built", re-run the build script. The system ignores extremely short or low-signal queries to reduce noise.


## License

This project is licensed under the **MIT License**. See the `LICENSE` file for more details. This means you are free to use, share, and adapt the material, provided you give appropriate credit.

## Citation

If you use the data or findings from this thesis in your own work, please cite it as follows:

```
[Dr. Saima Bashir]. ([2025]). "Histopathological Patterns in Abnormal Uterine Bleeding" (Master's Thesis). [Soura Medical Institute], [Srinagar, India]. Retrieved from [https://github.com/coad1024/abnormal-uterine-bleeding-thesis.git].
```

## Contact

For any questions or inquiries about this research, please contact [Dr Saima Bashir] at [symahanger99@gmail.com].
