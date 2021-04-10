import os
from flask import Flask, redirect, render_template, request, send_from_directory, url_for, jsonify

import numpy as np
import cv2
import warnings
import base64
import dlib
import json
from face_detector import get_face_detector, find_faces

warnings.filterwarnings("ignore", category=DeprecationWarning)


app = Flask(__name__)

APP_ROOT = os.path.dirname(os.path.abspath(__file__))
app.config['upload_folder'] = 'uploads'

def shape_to_np(shape, dtype="int"):
    # print("1")
	# initialize the list of (x, y)-coordinates
    coords = np.zeros((68, 2), dtype=dtype)
	# loop over the 68 facial landmarks and convert them
	# to a 2-tuple of (x, y)-coordinates
    for i in range(0, 68):
        coords[i] = (shape.part(i).x, shape.part(i).y)
	# return the list of (x, y)-coordinates
    return coords

def eye_on_mask(mask, side, shape):
    # print("2")
    points = [shape[i] for i in side]
    points = np.array(points, dtype=np.int32)
    mask = cv2.fillConvexPoly(mask, points, 255)
    l = points[0][0]
    t = (points[1][1]+points[2][1])//2
    r = points[3][0]
    b = (points[4][1]+points[5][1])//2
    return mask, [l, t, r, b]

def find_eyeball_position(end_points, cx, cy):
    # print("3")

    x_ratio = (end_points[0] - cx)/(cx - end_points[2])
    y_ratio = (cy - end_points[1])/(end_points[3] - cy)
    print(x_ratio)
    print(y_ratio)
    if x_ratio > 1.00:
        return 1
    elif x_ratio < 0.6:
        return 2
    elif y_ratio <= 1.3:
        return 3
    else:
        return 0

    
def contouring(thresh, mid, end_points, right=False):
    # print("4")
    cnts, _ = cv2.findContours(thresh, cv2.RETR_EXTERNAL,cv2.CHAIN_APPROX_NONE)
    try:
        cnt = max(cnts, key = cv2.contourArea)
        M = cv2.moments(cnt)
        cx = int(M['m10']/M['m00'])
        cy = int(M['m01']/M['m00'])
        if right:
            cx += mid
        pos = find_eyeball_position(end_points, cx, cy)
        return pos
    except Exception as e:
        print(e)
        pass
    
def process_thresh(thresh):
    # print("5")
    thresh = cv2.erode(thresh, None, iterations=2) 
    thresh = cv2.dilate(thresh, None, iterations=4) 
    thresh = cv2.medianBlur(thresh, 3) 
    thresh = cv2.bitwise_not(thresh)
    return thresh

def print_eye_pos(left, right):
    # print("6")
    flag = 0
    if left == right and left != 0:
        text = ''
        if left == 1:
            print('Looking left')
            text = 'Looking left'
            flag = 1
        elif left == 2:
            print('Looking right')
            text = 'Looking right'
            flag = 1
        elif left == 3:
            print('Looking up')
            text = 'Looking up'
            flag = 1

    return flag

@app.route('/predict', methods = ['GET', 'POST'])
def predict():
    if request.method == "POST":
        flag = 0
        r = request.data.decode('utf-8')
        _, encoded = r.split(",", 1) 

        imgdata = base64.b64decode(encoded)
        im_arr = np.frombuffer(imgdata, dtype=np.uint8)  # im_arr is one-dim Numpy array
        img = cv2.imdecode(im_arr, flags=cv2.IMREAD_COLOR)

        print(img.shape)

        # detector = dlib.get_frontal_face_detector()
        face_model = get_face_detector()
        predictor = dlib.shape_predictor('shape_68.dat')

        left = [36, 37, 38, 39, 40, 41]
        right = [42, 43, 44, 45, 46, 47]

        kernel = np.ones((9, 9), np.uint8)

        gray = cv2.cvtColor(img, cv2.COLOR_BGR2GRAY)
        rects = find_faces(img, face_model)
        # rects = detector(gray, 1)

        for rect in rects:
            # print(type(rect[0]))
            rec = dlib.rectangle(int(rect[0]), int(rect[1]), int(rect[2]), int(rect[3]))
            shape = predictor(gray, rec)
            shape = shape_to_np(shape)
            mask = np.zeros(img.shape[:2], dtype=np.uint8)
            mask, end_points_left = eye_on_mask(mask, left, shape)
            mask, end_points_right = eye_on_mask(mask, right, shape)
            mask = cv2.dilate(mask, kernel, 5)
            eyes = cv2.bitwise_and(img, img, mask=mask)
            mask = (eyes == [0, 0, 0]).all(axis=2)
            eyes[mask] = [255, 255, 255]
            mid = (shape[42][0] + shape[39][0]) // 2
            eyes_gray = cv2.cvtColor(eyes, cv2.COLOR_BGR2GRAY)
            # threshold = cv2.getTrackbarPos('threshold', 'image')
            _, thresh = cv2.threshold(eyes_gray, 90, 255, cv2.THRESH_BINARY)
            thresh = process_thresh(thresh)
            eyeball_pos_left = contouring(thresh[:, 0:mid], mid, end_points_left)
            eyeball_pos_right = contouring(thresh[:, mid:], mid, end_points_right, True)

            flag = print_eye_pos(eyeball_pos_left, eyeball_pos_right)
            op = dict()
            op['flag'] = json.dumps(flag)

            return jsonify(op)


if __name__ == '__main__':
    app.run(debug=False)