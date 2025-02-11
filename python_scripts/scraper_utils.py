from typing import List, Dict, Any
from fastai.vision.all import *
import requests
from pathlib import Path
import logging

# Set up logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)

class ScraperUtils:
    @staticmethod
    def download_image(url: str, save_path: Path) -> bool:
        """
        Download an image from a URL and save it to the specified path.
        
        Args:
            url (str): URL of the image to download
            save_path (Path): Path where the image should be saved
            
        Returns:
            bool: True if successful, False otherwise
        """
        try:
            response = requests.get(url, stream=True)
            response.raise_for_status()
            
            save_path.parent.mkdir(parents=True, exist_ok=True)
            with open(save_path, 'wb') as f:
                for chunk in response.iter_content(chunk_size=8192):
                    f.write(chunk)
            return True
        except Exception as e:
            logger.error(f"Error downloading image from {url}: {str(e)}")
            return False

    @staticmethod
    def process_image(image_path: Path) -> Any:
        """
        Process an image using FastAI.
        
        Args:
            image_path (Path): Path to the image file
            
        Returns:
            Any: Processed image data
        """
        try:
            # Load and process the image using FastAI
            img = load_image(image_path)
            # Add your FastAI processing logic here
            return img
        except Exception as e:
            logger.error(f"Error processing image {image_path}: {str(e)}")
            return None

    @staticmethod
    def save_results(data: Dict[str, Any], output_path: Path) -> bool:
        """
        Save processing results to a file.
        
        Args:
            data (Dict[str, Any]): Data to save
            output_path (Path): Path where to save the results
            
        Returns:
            bool: True if successful, False otherwise
        """
        try:
            output_path.parent.mkdir(parents=True, exist_ok=True)
            with open(output_path, 'w') as f:
                json.dump(data, f, indent=4)
            return True
        except Exception as e:
            logger.error(f"Error saving results to {output_path}: {str(e)}")
            return False
