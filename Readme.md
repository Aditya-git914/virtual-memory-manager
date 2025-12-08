📘 Virtual Memory Manager

A simulation of how an Operating System handles virtual memory, including logical-to-physical address translation, page tables, TLB (Translation Lookaside Buffer), and page fault handling.
This project demonstrates key OS memory management concepts through a working Virtual Memory Manager implementation.

🚀 Features

🔢 Logical → Physical Address Translation
Translates virtual addresses into physical addresses using page number + offset.

🧠 Page Table Implementation
Maps virtual pages to physical frames with efficient lookup.

⚡ TLB (Translation Lookaside Buffer)
Caches recent translations to improve speed and reduce lookup time.

❗ Page Fault Handling
Fetches the required page from a backing store when not available in memory.

♻️ Page Replacement Policy (FIFO/LRU)
Selects which frame to replace when memory is full.

📊 Statistics Output

Number of translated addresses

Page faults count & page fault rate

TLB hits & TLB hit rate

Frames used

🧩 How It Works

Read a logical address.

Extract:

Page number

Offset

Check TLB for a cached translation.

If TLB miss → check Page Table.

If page not found → Page Fault:

Load page from backing store into a free frame.

Apply FIFO/LRU replacement if needed.

Compute physical address:

physical = (frame_number * frame_size) + offset


Output:

Virtual address

Physical address

Value stored at physical address

📁 Project Structure
/vm-manager
 │── src/                    # Main source files
 │── include/                # Header files
 │── BackingStore.bin        # Simulated secondary storage
 │── addresses.txt           # Input logical addresses
 │── README.md               # Project documentation
 │── .gitignore
 │── ...

▶️ How to Run
Compile
g++ main.cpp -o vmm


(or use your build system)

Run
./vmm addresses.txt


Or specify your own input file.

📊 Example Output
Virtual Address: 16916
Physical Address: 52
Value: -12


At the end of execution:

Total addresses processed: 1000
TLB Hits: 42
TLB Hit Rate: 4.2%
Page Faults: 244
Page Fault Rate: 24.4%
