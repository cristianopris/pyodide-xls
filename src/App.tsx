import { useEffect, useRef } from 'react';
import { FileSpreadsheet, Info } from 'lucide-react';

const STREAMLIT_CODE = `
import streamlit as st
import pandas as pd
import io

st.set_page_config(page_title="Excel Viewer", layout="wide")

st.markdown("""
<style>
    .main {
        padding: 2rem;
    }
    .stAlert {
        border-radius: 12px;
    }
</style>
""", unsafe_allow_html=True)

st.title("📊 Excel File Viewer")
st.write("Browse and preview your Spreadsheet data securely in your browser.")

uploaded_file = st.file_uploader("Choose an Excel file", type=["xls", "xlsx"], help="Supports .xls and .xlsx formats")

if uploaded_file is not None:
    try:
        # Read the file
        # stlite handles the uploaded file as a BytesIO-like object
        file_extension = uploaded_file.name.split(".")[-1].lower()
        
        # xlrd is for .xls, openpyxl for .xlsx
        engine = "openpyxl" if file_extension == "xlsx" else "xlrd"
        
        with st.spinner("Processing spreadsheet..."):
            df = pd.read_excel(uploaded_file, engine=engine)
        
        st.success(f"Successfully loaded '{uploaded_file.name}'")
        
        # Layout for summary
        col1, col2, col3 = st.columns(3)
        with col1:
            st.metric("Rows", len(df))
        with col2:
            st.metric("Columns", len(df.columns))
        with col3:
            st.metric("Memory Usage", f"{df.memory_usage(deep=True).sum() / 1024:.1f} KB")

        st.subheader("📋 Data Preview")
        st.dataframe(df, use_container_width=True, height=500)
        
        if st.checkbox("Show Data Summary/Statistics"):
            st.subheader("📈 Statistical Summary")
            st.write(df.describe())
            
        if st.checkbox("Show Column Info"):
            st.subheader("ℹ️ Column Details")
            buffer = io.StringIO()
            df.info(buf=buffer)
            s = buffer.getvalue()
            st.text(s)

    except Exception as e:
        st.error(f"Error: Could not read the Excel file. Details: {str(e)}")
        st.info("Make sure the file is a valid Excel spreadsheet.")
else:
    st.info("👋 Welcome! Please upload an Excel file to get started.")
    
    st.markdown("---")
    st.markdown("### How it works")
    st.markdown("""
    1. **Privacy First**: Your data never leaves your computer. All processing happens locally in your browser using Pyodide and WebAssembly.
    2. **Powered by stlite**: A serverless version of Streamlit.
    3. **Instant Preview**: Large datasets are handled efficiently with browser-native performance.
    """)
`;

export default function App() {
  const mountNodeRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (mountNodeRef.current && window.stlite) {
      window.stlite.mount(
        {
          requirements: ["pandas", "openpyxl", "xlrd"],
          entrypoint: "streamlit_app.py",
          files: {
            "streamlit_app.py": STREAMLIT_CODE,
          },
        },
        mountNodeRef.current
      );
    }
  }, []);

  return (
    <div className="flex h-screen w-full bg-[#F9FAFB] text-slate-900 font-sans overflow-hidden">
      {/* Sidebar */}
      <aside className="w-80 bg-white border-r border-slate-200 p-8 flex flex-col gap-10 flex-shrink-0">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center text-white font-bold shadow-sm">
            <FileSpreadsheet size={18} />
          </div>
          <h1 className="text-xl font-semibold tracking-tight">PySheet Viewer</h1>
        </div>

        <div className="space-y-6">
          <div>
            <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-3">Status</p>
            <div className="p-4 bg-blue-50 border border-blue-100 rounded-xl">
              <div className="flex items-center gap-2 text-blue-700 mb-1">
                <div className="w-2 h-2 rounded-full bg-blue-500 animate-pulse"></div>
                <p className="text-xs font-bold uppercase">Stlite Runtime</p>
              </div>
              <p className="text-[11px] text-blue-600 leading-relaxed font-medium">
                Pyodide initialized. Environment ready for Excel processing.
              </p>
            </div>
          </div>

          <div>
            <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-3">About</p>
            <div className="space-y-3">
              <div className="flex items-start gap-3 p-3 rounded-lg hover:bg-slate-50 transition-colors border border-transparent hover:border-slate-100 group">
                <div className="bg-slate-100 p-1.5 rounded text-slate-500 group-hover:bg-white group-hover:text-blue-500 shadow-sm transition-all">
                  <Info size={14} />
                </div>
                <p className="text-xs text-slate-500 leading-tight">
                  All processing happens locally. Your data never leaves your browser.
                </p>
              </div>
            </div>
          </div>
        </div>

        <div className="mt-auto pb-4 border-t border-slate-100 pt-6">
          <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest mb-1">WASM Kernel</p>
          <p className="text-[10px] text-slate-500 font-medium">v0.75.0 • Pyodide 0.26.x</p>
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 flex flex-col min-w-0 bg-white">
        <header className="h-20 flex items-center justify-between px-10 border-b border-slate-100 flex-shrink-0">
          <div className="flex items-center gap-4">
            <span className="px-3 py-1 bg-slate-100 text-slate-600 rounded-full text-[11px] font-bold tracking-wide">
              STREAMLIT INTERFACE
            </span>
            <span className="text-slate-200 text-lg">|</span>
            <span className="text-sm text-slate-400 italic font-medium flex items-center gap-1.5">
              <FileSpreadsheet size={14} />
              Ready for upload
            </span>
          </div>
          <div className="flex gap-2">
            <button className="px-4 py-2 text-xs font-bold border border-slate-200 rounded-lg text-slate-600 hover:bg-slate-50 hover:border-slate-300 transition-all active:scale-95 shadow-sm">
              NEW SESSION
            </button>
            <button className="px-4 py-2 text-xs font-bold bg-slate-900 text-white rounded-lg hover:bg-slate-800 transition-all active:scale-95 shadow-md">
              ANALYSIS MODE
            </button>
          </div>
        </header>

        {/* Stlite Mounted Container */}
        <div className="flex-1 p-10 overflow-hidden bg-[#F9FAFB]">
          <div 
            ref={mountNodeRef} 
            className="h-full bg-white border border-slate-200 rounded-2xl shadow-[0_8px_30px_rgb(0,0,0,0.04)] overflow-hidden flex flex-col transition-all"
            id="stlite-container"
          />
        </div>
      </main>
    </div>
  );
}
