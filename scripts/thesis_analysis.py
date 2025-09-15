"""
Thesis Data Analysis and Visualization

This script analyzes the Masterchart.csv dataset containing histopathological diagnoses
and patient information. It generates multiple visualizations to support thesis findings.

Visualizations created:
1. Distribution of histopathological diagnoses (with log scale option)
2. Age distribution of patients
3. Common presenting complaints (with log scale option)
4. Histopathological diagnoses by age group
5. Correlation heatmap of key variables
6. Sankey diagram showing relationships between age groups and diagnoses
7. Additional insight: Drug history impact on diagnoses (new)
8. Interactive visualization options

All visualizations are saved to the figures folder.
"""

import pandas as pd
import matplotlib.pyplot as plt
import seaborn as sns
import os
import numpy as np
from matplotlib.colors import LinearSegmentedColormap
import plotly.graph_objects as go
import plotly.express as px
import plotly.io as pio
from plotly.subplots import make_subplots
import matplotlib.ticker as ticker
import networkx as nx
from scipy import stats

def main():
    # Set up paths with raw strings to handle Windows backslashes
    base_dir = r"C:\Users\coad1\OneDrive\Desktop\Thesis Figures and descriptions"
    data_path = os.path.join(base_dir, "data", "Masterchart.csv")
    figures_dir = os.path.join(base_dir, "figures")
    
    # Ensure figures directory exists
    os.makedirs(figures_dir, exist_ok=True)
    
    try:
        # --- Check for required libraries ---
        check_required_libraries()
        
        # --- Data Loading and Cleaning ---
        print("Loading and cleaning dataset...")
        df = load_and_clean_data(data_path)
        
        # --- Set plot styling for consistent look and feel ---
        set_plot_style()
        
        # --- Generate all visualizations ---
        print("\nGenerating visualizations...")
        
        # 1. Distribution of Histopathological Diagnoses (with log scale)
        create_diagnosis_distribution_chart(df, figures_dir, use_log_scale=True)
        
        # 2. Age Distribution of Patients
        create_age_distribution_chart(df, figures_dir)
        
        # 3. Common Presenting Complaints (with log scale)
        create_complaints_chart(df, figures_dir, use_log_scale=True)
        
        # 4. Histopathological Diagnosis by Age Group
        create_diagnosis_by_age_chart(df, figures_dir)
        
        # 5. Correlation Heatmap
        create_correlation_heatmap(df, figures_dir)
        
        # 6. Sankey Diagram (Age Group to Diagnosis)
        create_sankey_diagram(df, figures_dir)
        
        # 7. Drug History Impact on Diagnoses
        create_drug_history_impact_chart(df, figures_dir)
        
        # 8. Create chord diagram for relationships
        create_chord_diagram(df, figures_dir)
        
        # 9. Create sunburst chart for hierarchical view
        create_sunburst_chart(df, figures_dir)
        
        print("\nAll visualizations have been successfully generated in the figures folder.")
        
    except FileNotFoundError:
        print(f"Error: '{data_path}' not found. Please ensure the file is in the correct directory.")
    except ModuleNotFoundError as e:
        print(f"Missing required library: {e}")
        print("Please install required libraries using: pip install plotly networkx matplotlib seaborn pandas numpy scipy")
    except Exception as e:
        print(f"An error occurred during analysis: {e}")


def check_required_libraries():
    """Check if all required libraries are installed"""
    required_libraries = {
        'plotly': "For interactive and beautiful visualizations",
        'networkx': "For network graph and chord diagrams",
        'matplotlib': "For static visualizations",
        'seaborn': "For enhanced matplotlib plots",
        'pandas': "For data manipulation",
        'numpy': "For numerical operations",
        'scipy': "For statistical functions"
    }
    
    missing_libraries = []
    for lib, purpose in required_libraries.items():
        try:
            __import__(lib)
        except ImportError:
            missing_libraries.append(f"- {lib}: {purpose}")
    
    if missing_libraries:
        print("Missing required libraries:")
        for lib in missing_libraries:
            print(lib)
        print("\nPlease install these libraries using:")
        print("pip install plotly networkx matplotlib seaborn pandas numpy scipy")
        raise ModuleNotFoundError("Missing required libraries")


def load_and_clean_data(data_path):
    """Load and clean the dataset for analysis"""
    # Load the dataset
    df = pd.read_csv(data_path)
    
    # The first few columns are unnamed and empty, find the first valid column
    first_valid_col = df.columns[df.columns.str.contains('Histopathological', case=False, na=False)][0]
    df = df.loc[:, first_valid_col:]  # Keep columns from the first valid one onwards
    
    # Clean column names by stripping whitespace
    df.columns = df.columns.str.strip()
    
    # Drop rows where 'Histopathological diagnosis' is NaN
    df.dropna(subset=['Histopathological diagnosis'], inplace=True)
    
    # Clean the 'Histopathological diagnosis' column
    df['Histopathological diagnosis'] = df['Histopathological diagnosis'].str.strip()
    
    # Clean and standardize 'Drug history'
    if 'Drug history' in df.columns:
        df['Drug history'] = df['Drug history'].str.strip().str.lower()
        df['Drug history'] = df['Drug history'].replace({
            'no': 'No Hormonal Intake',
            'hormonal intake': 'Hormonal Intake',
            'hormonal hx': 'Hormonal Intake'
        })
    
    # Convert 'Age' to numeric, handling errors
    df['Age'] = pd.to_numeric(df['Age'], errors='coerce')
    df.dropna(subset=['Age'], inplace=True)  # Drop rows where age couldn't be converted
    df['Age'] = df['Age'].astype(int)
    
    # Create age groups for analysis
    df['Age Group'] = pd.cut(
        df['Age'], 
        bins=[0, 30, 40, 50, 60, 100], 
        labels=['20-30', '31-40', '41-50', '51-60', '60+']
    )
    
    return df


def set_plot_style():
    """Set consistent styling for all visualizations"""
    sns.set_style("whitegrid")
    plt.rcParams['figure.figsize'] = (12, 8)
    plt.rcParams['figure.dpi'] = 300  # Higher resolution
    plt.rcParams['axes.titlesize'] = 18
    plt.rcParams['axes.labelsize'] = 14
    plt.rcParams['xtick.labelsize'] = 12
    plt.rcParams['ytick.labelsize'] = 12
    
    # Create custom color palettes
    global custom_palette, custom_cmap
    custom_palette = sns.color_palette("viridis", 12)
    custom_cmap = LinearSegmentedColormap.from_list("custom_cmap", sns.color_palette("coolwarm", 12))


def create_diagnosis_distribution_chart(df, figures_dir, use_log_scale=False):
    """
    Create a bar chart showing distribution of histopathological diagnoses
    
    Args:
        df: DataFrame with the data
        figures_dir: Directory to save the figure
        use_log_scale: Whether to use logarithmic scale for better visibility of variations
    """
    plt.figure(figsize=(14, 10))
    
    # Group rare diagnoses together
    diagnosis_counts = df['Histopathological diagnosis'].value_counts()
    threshold = len(df) * 0.01  # 1% threshold to include more categories
    
    # Keep diagnoses that appear more than threshold times, group others
    main_diagnoses = diagnosis_counts[diagnosis_counts >= threshold].index.tolist()
    
    # Copy df to avoid SettingWithCopyWarning
    df_plot = df.copy()
    df_plot.loc[~df_plot['Histopathological diagnosis'].isin(main_diagnoses), 'Histopathological diagnosis'] = 'Other'
    
    # Plot with sorted values
    diagnoses_plot = df_plot['Histopathological diagnosis'].value_counts().sort_values(ascending=False)
    
    # Create custom color palette with more contrast between adjacent bars
    colors = sns.color_palette("viridis", len(diagnoses_plot))
    
    # Plot the bars
    ax = sns.barplot(x=diagnoses_plot.index, y=diagnoses_plot.values, palette=colors, errorbar=None)
    
    # Apply log scale if requested
    if use_log_scale:
        plt.yscale('symlog')  # symlog preserves zero values
        plt.ylabel('Number of Cases (log scale)')
        
        # Add grid lines that make sense with log scale
        ax.yaxis.grid(True, which="both", linestyle="--", linewidth=0.5, alpha=0.7)
        
        # Format y-axis ticks to show actual values, not log values
        ax.yaxis.set_major_formatter(ticker.ScalarFormatter())
    else:
        plt.ylabel('Number of Cases')
    
    # Add count and percentage labels on bars
    total = len(df_plot)
    for i, p in enumerate(ax.patches):
        percentage = 100 * p.get_height() / total
        
        # Position the text differently depending on bar height
        if p.get_height() > 10 or not use_log_scale:
            ax.annotate(f'{int(p.get_height())}\n({percentage:.1f}%)', 
                      (p.get_x() + p.get_width() / 2., p.get_height()),
                      ha='center', va='bottom', fontsize=10, 
                      color='black', weight='bold')
        else:
            # For shorter bars when using log scale, place text above bar
            ax.annotate(f'{int(p.get_height())}\n({percentage:.1f}%)', 
                      (p.get_x() + p.get_width() / 2., p.get_height() + 1),
                      ha='center', va='bottom', fontsize=9,
                      color='black', weight='bold')
    
    # Add a more descriptive title
    plt.title('Distribution of Histopathological Diagnoses in AUB Patients', fontsize=18)
    plt.xlabel('Diagnosis', fontsize=14)
    
    plt.xticks(rotation=45, ha='right')
    plt.tight_layout()
    
    # Add box around the plot for better definition
    for spine in ax.spines.values():
        spine.set_visible(True)
        spine.set_color('black')
        spine.set_linewidth(1)
    
    # Save the standard figure
    suffix = "_log" if use_log_scale else ""
    output_path = os.path.join(figures_dir, f'histopathological_diagnoses{suffix}.png')
    plt.savefig(output_path, dpi=300, bbox_inches='tight')
    plt.close()
    print(f"✓ Generated 'histopathological_diagnoses{suffix}.png'")
    
    # Also create an interactive Plotly version
    try:
        fig = px.bar(
            x=diagnoses_plot.index,
            y=diagnoses_plot.values,
            color=diagnoses_plot.index,
            labels={'x': 'Diagnosis', 'y': 'Number of Cases'},
            title='Distribution of Histopathological Diagnoses',
            color_discrete_sequence=px.colors.qualitative.Bold,
            text=[f"{v} ({100*v/total:.1f}%)" for v in diagnoses_plot.values]
        )
        
        if use_log_scale:
            fig.update_layout(yaxis_type="log")
            
        fig.update_layout(
            xaxis_tickangle=45,
            showlegend=False,
            hoverlabel=dict(bgcolor="white", font_size=14),
            plot_bgcolor='rgba(245, 245, 245, 1)',
        )
        
        # Save as interactive HTML
        html_path = os.path.join(figures_dir, f'histopathological_diagnoses{suffix}_interactive.html')
        fig.write_html(html_path)
        print(f"✓ Generated interactive 'histopathological_diagnoses{suffix}_interactive.html'")
    except Exception as e:
        print(f"  Warning: Could not generate interactive plot: {e}")


def create_age_distribution_chart(df, figures_dir):
    """Create a visually enhanced histogram showing age distribution of patients"""
    plt.figure(figsize=(14, 8))
    
    # Create a color gradient for the histogram bars
    color_gradient = sns.color_palette("viridis", n_colors=10)
    
    # Create a more detailed histogram with KDE
    ax = sns.histplot(
        df['Age'], 
        bins=np.arange(20, 71, 5), 
        kde=True, 
        color='teal'
    )
    
    # Add statistical annotations
    mean_age = df['Age'].mean()
    median_age = df['Age'].median()
    std_age = df['Age'].std()
    mode_age = df['Age'].mode()[0]
    
    # Add mean line
    plt.axvline(mean_age, color='red', linestyle='dashed', linewidth=2, alpha=0.8)
    plt.text(
        mean_age + 0.5, 
        plt.ylim()[1]*0.9, 
        f'Mean: {mean_age:.1f} yrs', 
        color='red', 
        fontsize=12,
        bbox=dict(facecolor='white', alpha=0.8, boxstyle='round,pad=0.5')
    )
    
    # Add median line
    plt.axvline(median_age, color='purple', linestyle='dashdot', linewidth=2, alpha=0.8)
    plt.text(
        median_age + 0.5, 
        plt.ylim()[1]*0.8, 
        f'Median: {median_age:.1f} yrs', 
        color='purple', 
        fontsize=12,
        bbox=dict(facecolor='white', alpha=0.8, boxstyle='round,pad=0.5')
    )
    
    # Add age group annotations
    for age in [30, 40, 50, 60]:
        plt.axvline(age, color='gray', linestyle=':', linewidth=1, alpha=0.7)
        plt.text(age-2, plt.ylim()[1]*0.05, f'{age}', color='gray', fontsize=10)
    
    # Add statistics box
    stats_text = f"""Statistics:
Mean: {mean_age:.1f} years
Median: {median_age:.1f} years
Mode: {mode_age} years
Std Dev: {std_age:.1f} years
Min: {df['Age'].min()} years
Max: {df['Age'].max()} years
"""
    
    plt.text(
        0.02, 0.97, stats_text,
        transform=plt.gca().transAxes,
        fontsize=12,
        verticalalignment='top',
        bbox=dict(boxstyle='round,pad=0.5', facecolor='white', alpha=0.8)
    )
    
    plt.title('Age Distribution of Patients with Abnormal Uterine Bleeding', fontsize=18)
    plt.xlabel('Age (years)', fontsize=14)
    plt.ylabel('Number of Patients', fontsize=14)
    
    # Add grid for better readability
    plt.grid(axis='y', linestyle='--', alpha=0.7)
    
    # Add box around the plot for better definition
    for spine in ax.spines.values():
        spine.set_visible(True)
        spine.set_color('black')
        spine.set_linewidth(1)
    
    plt.tight_layout()
    
    # Save the figure with higher resolution
    output_path = os.path.join(figures_dir, 'age_distribution.png')
    plt.savefig(output_path, dpi=300, bbox_inches='tight')
    plt.close()
    print(f"✓ Generated 'age_distribution.png'")
    
    # Create an interactive plotly version
    try:
        # Create a figure with plotly
        fig = px.histogram(
            df, 
            x="Age",
            nbins=50,
            marginal="box",  # Add a box plot on the margin
            color_discrete_sequence=['teal'],
            opacity=0.7,
            histnorm="percent",  # Show as percentages
            title="Age Distribution of Patients with AUB"
        )
        
        # Add a KDE curve
        fig.add_scatter(
            x=np.linspace(df['Age'].min(), df['Age'].max(), 100),
            y=stats.gaussian_kde(df['Age'])(np.linspace(df['Age'].min(), df['Age'].max(), 100)) * 100,
            mode='lines',
            line=dict(color='darkblue', width=2),
            name='KDE'
        )
        
        # Add age group markers
        for age in [30, 40, 50, 60]:
            fig.add_shape(
                type="line",
                x0=age, y0=0,
                x1=age, y1=fig.data[0]['y'].max(),
                line=dict(color="gray", width=1, dash="dot")
            )
        
        # Add mean line
        fig.add_shape(
            type="line",
            x0=mean_age, y0=0,
            x1=mean_age, y1=fig.data[0]['y'].max(),
            line=dict(color="red", width=2, dash="dash")
        )
        
        # Add annotations
        fig.add_annotation(
            x=mean_age+2, y=fig.data[0]['y'].max()*0.9,
            text=f"Mean: {mean_age:.1f} yrs",
            showarrow=True,
            arrowhead=1,
            ax=20, ay=-30,
            bgcolor="white",
            bordercolor="red"
        )
        
        fig.update_layout(
            xaxis_title="Age (years)",
            yaxis_title="Percentage of Patients (%)",
            hoverlabel=dict(bgcolor="white", font_size=14),
            plot_bgcolor='rgba(245, 245, 245, 1)'
        )
        
        # Save as interactive HTML
        html_path = os.path.join(figures_dir, 'age_distribution_interactive.html')
        fig.write_html(html_path)
        print(f"✓ Generated interactive 'age_distribution_interactive.html'")
    except Exception as e:
        print(f"  Warning: Could not generate interactive plot: {e}")


def create_complaints_chart(df, figures_dir, use_log_scale=False):
    """
    Create a horizontal bar chart showing common presenting complaints
    
    Args:
        df: DataFrame with the data
        figures_dir: Directory to save the figure
        use_log_scale: Whether to use logarithmic scale for better visibility of variations
    """
    plt.figure(figsize=(14, 9))
    
    # Correct for potential typos in 'Compalints' column name
    complaint_col = 'Compalints' if 'Compalints' in df.columns else 'Complaints'
    
    if complaint_col not in df.columns:
        print(f"Warning: No column found for complaints. Available columns: {df.columns.tolist()}")
        return
    
    # Sort complaints by frequency
    complaint_counts = df[complaint_col].value_counts().sort_values(ascending=True)
    
    # Create custom color gradient for better visual appeal
    colors = sns.color_palette("plasma", len(complaint_counts))
    
    # Create horizontal bar chart
    ax = sns.barplot(y=complaint_counts.index, x=complaint_counts.values, palette=colors, orient='h', errorbar=None)
    
    # Apply log scale if requested
    if use_log_scale:
        plt.xscale('symlog')  # symlog preserves zero values
        plt.xlabel('Number of Cases (log scale)')
        
        # Add grid lines that make sense with log scale
        ax.xaxis.grid(True, which="both", linestyle="--", linewidth=0.5, alpha=0.7)
        
        # Format x-axis ticks to show actual values, not log values
        ax.xaxis.set_major_formatter(ticker.ScalarFormatter())
    else:
        plt.xlabel('Number of Cases')
    
    # Add count and percentage labels on bars
    total = complaint_counts.sum()
    for i, p in enumerate(ax.patches):
        percentage = 100 * p.get_width() / total
        
        # Different positioning based on bar width
        if p.get_width() > 5 or not use_log_scale:
            ax.annotate(f'{int(p.get_width())} ({percentage:.1f}%)', 
                      (p.get_width() + (0.1 * max(complaint_counts)), p.get_y() + p.get_height()/2),
                      va='center', fontsize=10, color='black', weight='bold')
        else:
            # For shorter bars when using log scale
            ax.annotate(f'{int(p.get_width())} ({percentage:.1f}%)', 
                      (p.get_width() + 1, p.get_y() + p.get_height()/2),
                      va='center', fontsize=9, color='black', weight='bold')
    
    # Add a more descriptive title
    plt.title('Most Common Presenting Complaints in AUB Patients', fontsize=18)
    plt.ylabel('Complaint Type', fontsize=14)
    
    # Add box around the plot for better definition
    for spine in ax.spines.values():
        spine.set_visible(True)
        spine.set_color('black')
        spine.set_linewidth(1)
    
    plt.tight_layout()
    
    # Save the standard figure
    suffix = "_log" if use_log_scale else ""
    output_path = os.path.join(figures_dir, f'common_complaints{suffix}.png')
    plt.savefig(output_path, dpi=300, bbox_inches='tight')
    plt.close()
    print(f"✓ Generated 'common_complaints{suffix}.png'")
    
    # Also create an interactive Plotly version
    try:
        # Create an interactive version with Plotly
        fig = px.bar(
            y=complaint_counts.index,
            x=complaint_counts.values,
            color=complaint_counts.index,
            orientation='h',
            labels={'y': 'Complaint', 'x': 'Number of Cases'},
            title='Most Common Presenting Complaints',
            color_discrete_sequence=px.colors.sequential.Plasma,
            text=[f"{v} ({100*v/total:.1f}%)" for v in complaint_counts.values]
        )
        
        if use_log_scale:
            fig.update_layout(xaxis_type="log")
            
        fig.update_layout(
            showlegend=False,
            hoverlabel=dict(bgcolor="white", font_size=14),
            plot_bgcolor='rgba(245, 245, 245, 1)'
        )
        
        # Improve text position
        fig.update_traces(
            textposition='outside', 
            textfont=dict(size=12)
        )
        
        # Save as interactive HTML
        html_path = os.path.join(figures_dir, f'common_complaints{suffix}_interactive.html')
        fig.write_html(html_path)
        print(f"✓ Generated interactive 'common_complaints{suffix}_interactive.html'")
    except Exception as e:
        print(f"  Warning: Could not generate interactive plot: {e}")


def create_diagnosis_by_age_chart(df, figures_dir):
    """Create a stacked bar chart showing diagnoses by age group"""
    # Focus on the top diagnoses for clarity
    top_diagnoses = df['Histopathological diagnosis'].value_counts().nlargest(6).index
    df_top = df[df['Histopathological diagnosis'].isin(top_diagnoses)].copy()
    
    # Create cross-tabulation
    age_diag_crosstab = pd.crosstab(df_top['Age Group'], df_top['Histopathological diagnosis'])
    
    # Normalize to get proportions
    age_diag_crosstab_norm = age_diag_crosstab.div(age_diag_crosstab.sum(axis=1), axis=0)
    
    # Create the plot
    plt.figure(figsize=(16, 10))
    age_diag_crosstab_norm.plot(kind='bar', stacked=True, colormap='tab20')
    
    plt.title('Histopathological Diagnosis Distribution by Age Group')
    plt.xlabel('Age Group')
    plt.ylabel('Proportion of Cases')
    plt.xticks(rotation=0)
    plt.legend(title='Diagnosis', bbox_to_anchor=(1.05, 1), loc='upper left')
    plt.grid(axis='y', linestyle='--', alpha=0.7)
    plt.tight_layout()
    
    # Save the figure
    output_path = os.path.join(figures_dir, 'diagnosis_by_age_group.png')
    plt.savefig(output_path)
    plt.close()
    print(f"✓ Generated 'diagnosis_by_age_group.png'")


def create_correlation_heatmap(df, figures_dir):
    """Create a heatmap showing correlations between key variables"""
    # Create a copy for encoding
    df_corr = df.copy()
    
    # Select relevant columns
    key_columns = ['Age']
    
    # Check if other columns exist in the dataset
    for col in ['Histopathological diagnosis', 'Compalints', 'Drug history', 'correlation with LMP']:
        if col in df_corr.columns:
            # Convert categorical columns to numerical using factorize
            df_corr[col] = pd.factorize(df_corr[col])[0]
            key_columns.append(col)
    
    # Calculate correlation
    plt.figure(figsize=(12, 10))
    correlation_matrix = df_corr[key_columns].corr()
    
    # Create mask for the upper triangle
    mask = np.triu(np.ones_like(correlation_matrix, dtype=bool))
    
    # Create heatmap with annotations
    heatmap = sns.heatmap(
        correlation_matrix, 
        mask=mask,
        annot=True, 
        cmap='coolwarm', 
        fmt=".2f",
        linewidths=0.5,
        cbar_kws={"shrink": 0.8}
    )
    
    plt.title('Correlation Heatmap of Key Variables', pad=20)
    plt.xticks(rotation=45)
    plt.tight_layout()
    
    # Save the figure
    output_path = os.path.join(figures_dir, 'correlation_heatmap.png')
    plt.savefig(output_path)
    plt.close()
    print(f"✓ Generated 'correlation_heatmap.png'")


def create_drug_history_impact_chart(df, figures_dir):
    """Create a chart showing the impact of drug history on diagnoses (new analysis)"""
    # Ensure 'Drug history' column exists
    if 'Drug history' not in df.columns:
        print("Warning: 'Drug history' column not found, skipping drug history impact chart")
        return
    
    # Focus on top diagnoses for clarity
    top_diagnoses = df['Histopathological diagnosis'].value_counts().nlargest(8).index
    
    # Filter data
    df_subset = df[df['Histopathological diagnosis'].isin(top_diagnoses)]
    
    # Create cross-tabulation
    cross_tab = pd.crosstab(
        df_subset['Histopathological diagnosis'], 
        df_subset['Drug history'],
        normalize='index'
    ) * 100  # Convert to percentage
    
    # Plot the data
    plt.figure(figsize=(14, 10))
    cross_tab.plot(kind='bar', stacked=False, rot=45)
    
    plt.title('Impact of Hormonal Intake on Histopathological Diagnoses')
    plt.xlabel('Histopathological Diagnosis')
    plt.ylabel('Percentage (%)')
    plt.legend(title='Drug History')
    plt.grid(axis='y', linestyle='--', alpha=0.7)
    
    # Add percentage labels
    for i, diagnosis in enumerate(cross_tab.index):
        for j, column in enumerate(cross_tab.columns):
            percentage = cross_tab.loc[diagnosis, column]
            if percentage > 5:  # Only show percentage if it's significant
                plt.text(
                    i + (j - 0.5) * 0.4,  # Adjust x position based on column
                    percentage + 2,       # Place text slightly above the bar
                    f'{percentage:.1f}%',
                    ha='center',
                    fontsize=9
                )
    
    plt.tight_layout()
    
    # Save the figure
    output_path = os.path.join(figures_dir, 'drug_history_impact.png')
    plt.savefig(output_path)
    plt.close()
    print(f"✓ Generated 'drug_history_impact.png'")


def create_sankey_diagram(df, figures_dir):
    """Create a Sankey diagram showing the flow between age groups and diagnoses"""
    try:
        # Focus on top diagnoses for clarity
        top_diagnoses = df['Histopathological diagnosis'].value_counts().nlargest(6).index.tolist()
        df_plot = df.copy()
        df_plot.loc[~df_plot['Histopathological diagnosis'].isin(top_diagnoses), 'Histopathological diagnosis'] = 'Other diagnoses'
        
        # Create cross-tabulation
        cross_tab = pd.crosstab(df_plot['Age Group'], df_plot['Histopathological diagnosis'])
        
        # Prepare data for Sankey diagram
        age_groups = cross_tab.index.tolist()
        diagnoses = cross_tab.columns.tolist()
        
        # Create nodes list (source nodes + target nodes)
        nodes = age_groups + diagnoses
        
        # Create source and target lists for links
        source = []
        target = []
        value = []
        
        # Populate source, target, and value lists
        for i, age in enumerate(age_groups):
            for j, diag in enumerate(diagnoses):
                if cross_tab.loc[age, diag] > 0:
                    source.append(i)
                    target.append(len(age_groups) + j)  # offset by number of age groups
                    value.append(cross_tab.loc[age, diag])
        
        # Create color scale for nodes
        node_colors = px.colors.qualitative.Bold[:len(age_groups)] + px.colors.qualitative.Pastel[:(len(diagnoses))]
        
        # Create the figure
        fig = go.Figure(data=[go.Sankey(
            node=dict(
                pad=15,
                thickness=20,
                line=dict(color="black", width=0.5),
                label=nodes,
                color=node_colors
            ),
            link=dict(
                source=source,
                target=target,
                value=value,
                color=["rgba(0,0,255,0.3)"] * len(source)  # semi-transparent blue links
            )
        )])
        
        # Update layout
        fig.update_layout(
            title_text="Flow from Age Groups to Histopathological Diagnoses",
            font_size=14,
            autosize=True,
            width=1200,
            height=800,
        )
        
        # Save as interactive HTML
        html_path = os.path.join(figures_dir, 'age_to_diagnosis_sankey.html')
        fig.write_html(html_path)
        print(f"✓ Generated interactive Sankey diagram 'age_to_diagnosis_sankey.html'")
        
        # Also save as PNG for static view
        png_path = os.path.join(figures_dir, 'age_to_diagnosis_sankey.png')
        pio.write_image(fig, png_path)
        print(f"✓ Generated static Sankey diagram 'age_to_diagnosis_sankey.png'")
    except Exception as e:
        print(f"  Warning: Could not generate Sankey diagram: {e}")


def create_chord_diagram(df, figures_dir):
    """Create a chord diagram showing relationships between diagnoses and complaints"""
    try:
        # Focus on top categories for clarity
        top_diagnoses = df['Histopathological diagnosis'].value_counts().nlargest(5).index.tolist()
        
        # Determine complaint column name
        complaint_col = 'Compalints' if 'Compalints' in df.columns else 'Complaints'
        
        if complaint_col not in df.columns:
            print(f"Warning: No column found for complaints. Skipping chord diagram.")
            return
            
        top_complaints = df[complaint_col].value_counts().nlargest(5).index.tolist()
        
        # Filter data
        df_plot = df[
            (df['Histopathological diagnosis'].isin(top_diagnoses)) & 
            (df[complaint_col].isin(top_complaints))
        ].copy()
        
        # Create cross-tabulation
        matrix = pd.crosstab(df_plot['Histopathological diagnosis'], df_plot[complaint_col])
        
        # Create a NetworkX graph
        G = nx.Graph()
        
        # Add nodes
        for diag in top_diagnoses:
            G.add_node(diag, bipartite=0)
        
        for comp in top_complaints:
            G.add_node(comp, bipartite=1)
        
        # Add edges based on frequency
        for diag in top_diagnoses:
            for comp in top_complaints:
                if matrix.loc[diag, comp] > 0:
                    G.add_edge(diag, comp, weight=matrix.loc[diag, comp])
        
        # Create positions for nodes (separate diagnoses and complaints)
        pos = nx.circular_layout(G)
        
        # Create a Matplotlib figure
        plt.figure(figsize=(16, 16))
        
        # Draw nodes
        diag_nodes = [node for node, data in G.nodes(data=True) if data.get('bipartite') == 0]
        comp_nodes = [node for node, data in G.nodes(data=True) if data.get('bipartite') == 1]
        
        nx.draw_networkx_nodes(G, pos, nodelist=diag_nodes, node_color='lightblue', node_size=3000, alpha=0.8)
        nx.draw_networkx_nodes(G, pos, nodelist=comp_nodes, node_color='lightgreen', node_size=3000, alpha=0.8)
        
        # Draw edges with varying width based on weight
        edge_width = [G[u][v]['weight']/2 for u, v in G.edges()]
        nx.draw_networkx_edges(G, pos, width=edge_width, alpha=0.5, edge_color='gray')
        
        # Draw labels
        nx.draw_networkx_labels(G, pos, font_size=12, font_family='sans-serif')
        
        plt.title("Relationships Between Diagnoses and Complaints", fontsize=20)
        plt.axis('off')
        plt.tight_layout()
        
        # Save the figure
        output_path = os.path.join(figures_dir, 'diagnosis_complaint_relationships.png')
        plt.savefig(output_path, dpi=300, bbox_inches='tight')
        plt.close()
        print(f"✓ Generated 'diagnosis_complaint_relationships.png'")
    except Exception as e:
        print(f"  Warning: Could not generate chord diagram: {e}")


def create_sunburst_chart(df, figures_dir):
    """Create a sunburst chart for hierarchical view of diagnoses by age group and drug history"""
    try:
        # Create a copy of the dataframe
        df_plot = df.copy()
        
        # Ensure we have the required columns
        required_cols = ['Age Group', 'Histopathological diagnosis', 'Drug history']
        if not all(col in df_plot.columns for col in required_cols):
            print(f"Warning: Missing columns for sunburst chart. Available: {df_plot.columns.tolist()}")
            return
            
        # Group rare diagnoses for better visualization
        diagnosis_counts = df_plot['Histopathological diagnosis'].value_counts()
        threshold = len(df_plot) * 0.02
        main_diagnoses = diagnosis_counts[diagnosis_counts >= threshold].index.tolist()
        df_plot.loc[~df_plot['Histopathological diagnosis'].isin(main_diagnoses), 'Histopathological diagnosis'] = 'Other'
        
        # Create the figure
        fig = px.sunburst(
            df_plot,
            path=['Age Group', 'Drug history', 'Histopathological diagnosis'],
            color='Age Group',
            color_discrete_sequence=px.colors.qualitative.Bold,
            title='Hierarchical View: Age Group → Drug History → Diagnosis'
        )
        
        fig.update_layout(
            margin=dict(t=30, l=0, r=0, b=0),
            font=dict(size=14),
            width=1000,
            height=1000
        )
        
        # Save as interactive HTML
        html_path = os.path.join(figures_dir, 'diagnosis_hierarchy_sunburst.html')
        fig.write_html(html_path)
        print(f"✓ Generated interactive sunburst chart 'diagnosis_hierarchy_sunburst.html'")
        
        # Also save as PNG
        png_path = os.path.join(figures_dir, 'diagnosis_hierarchy_sunburst.png')
        pio.write_image(fig, png_path)
        print(f"✓ Generated static sunburst chart 'diagnosis_hierarchy_sunburst.png'")
    except Exception as e:
        print(f"  Warning: Could not generate sunburst chart: {e}")


if __name__ == "__main__":
    main()