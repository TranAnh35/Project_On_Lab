import pyaudio
import wave
import whisper
import keyboard
import os

from utils import *

# Cấu hình audio
FORMAT = pyaudio.paInt16
CHANNELS = 1
RATE = 16000
CHUNK = 1024
AUDIO_FILE = "recorded_audio.wav"
AUDIO_FILE_PROCESSED = "processed_audio.wav"

# Khởi tạo model Whisper
model = whisper.load_model("small")  # Hoặc "tiny" nếu cần tiết kiệm tài nguyên

# Hàm chính
def main():
    print("Nhấn phím 'V' để bắt đầu thu âm...")
    while True:
        if keyboard.is_pressed('v'):  # Bắt đầu thu âm khi nhấn phím V
            record_audio(FORMAT, CHANNELS, RATE, CHUNK, AUDIO_FILE)
            text_1 = transcribe_audio(model, AUDIO_FILE)
            audio_pipeline(AUDIO_FILE, AUDIO_FILE_PROCESSED)
            text_2 = transcribe_audio(model, AUDIO_FILE_PROCESSED)
            print("Nhấn 'Q' để thoát hoặc 'V' để thu âm lại.")
        
        if keyboard.is_pressed('q'):  # Thoát khi nhấn phím Q
            os.remove(AUDIO_FILE)
            os.remove(AUDIO_FILE_PROCESSED)
            print("Đã thoát chương trình.")
            break

# Chạy chương trình
if __name__ == "__main__":
    main()
