import os

def combine_files_to_txt(repo_path="config", output_file="backend_config.txt"):
    with open(output_file, "w", encoding="utf-8") as outfile:
        for root, dirs, files in os.walk(repo_path):
            for file in files:
                file_path = os.path.join(root, file)
                print("Trying:", file_path)  # Debug info
                try:
                    with open(file_path, "r", encoding="utf-8") as infile:
                        content = infile.read()
                        outfile.write(f"\n\n--- {file_path} ---\n")
                        outfile.write(content)
                except Exception as e:
                    print("Skipped:", file_path, "| Reason:", str(e))
                    continue

# Run it
combine_files_to_txt()
