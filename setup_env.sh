#!/bin/bash

# Create conda environment
conda create -n parlayer python=3.11 -y

# Activate environment
conda activate parlayer

# Install requirements
pip install -r requirements.txt

# Install development dependencies
pip install pytest pytest-asyncio httpx
