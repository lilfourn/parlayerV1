from pathlib import Path
import argparse
import logging
from scraper_utils import ScraperUtils

# Set up logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)

def setup_argparse() -> argparse.ArgumentParser:
    """Set up command line argument parsing."""
    parser = argparse.ArgumentParser(description='FastAI Image Processing Script')
    parser.add_argument(
        '--input', 
        type=str, 
        required=True,
        help='Input image URL or directory path'
    )
    parser.add_argument(
        '--output', 
        type=str, 
        default='output',
        help='Output directory path (default: output)'
    )
    return parser

def main():
    """Main execution function."""
    # Parse command line arguments
    parser = setup_argparse()
    args = parser.parse_args()
    
    # Convert string paths to Path objects
    input_path = Path(args.input)
    output_path = Path(args.output)
    
    try:
        # Create output directory if it doesn't exist
        output_path.mkdir(parents=True, exist_ok=True)
        
        if input_path.is_dir():
            # Process all images in directory
            for img_path in input_path.glob('*.{jpg,jpeg,png}'):
                process_single_image(img_path, output_path)
        else:
            # Process single image
            process_single_image(input_path, output_path)
            
    except Exception as e:
        logger.error(f"An error occurred: {str(e)}")
        return 1
    
    return 0

def process_single_image(image_path: Path, output_path: Path):
    """Process a single image and save results."""
    logger.info(f"Processing image: {image_path}")
    
    # Initialize our utilities
    utils = ScraperUtils()
    
    # Process the image
    processed_data = utils.process_image(image_path)
    
    if processed_data is not None:
        # Save results
        result_path = output_path / f"{image_path.stem}_results.json"
        if utils.save_results({"results": processed_data}, result_path):
            logger.info(f"Results saved to {result_path}")
        else:
            logger.error(f"Failed to save results for {image_path}")
    else:
        logger.error(f"Failed to process {image_path}")

if __name__ == "__main__":
    exit(main())
