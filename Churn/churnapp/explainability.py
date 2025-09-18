import shap

def get_feature_importance(model, input_df):
    explainer = shap.TreeExplainer(model)
    shap_values = explainer.shap_values(input_df)
    importance = dict(zip(input_df.columns, shap_values[0]))
    sorted_importance = dict(sorted(importance.items(), key=lambda x: abs(x[1]), reverse=True))
    return sorted_importance
